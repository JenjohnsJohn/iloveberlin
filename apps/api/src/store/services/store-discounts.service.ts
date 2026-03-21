import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode, DiscountType } from '../entities/discount-code.entity';
import { CreateDiscountDto, ValidateDiscountDto } from '../dto/create-discount.dto';
import { sanitize } from '../../common/utils/sanitize.util';

@Injectable()
export class StoreDiscountsService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepository: Repository<DiscountCode>,
  ) {}

  private sanitizeHtml(input: string): string {
    return sanitize(input);
  }

  async validateDiscount(
    dto: ValidateDiscountDto,
  ): Promise<{ valid: boolean; discount?: DiscountCode; message?: string }> {
    const discount = await this.validateDiscountInternal(
      dto.code,
      dto.order_total || 0,
    );

    if (!discount) {
      return { valid: false, message: 'Invalid or expired discount code' };
    }

    return { valid: true, discount };
  }

  async validateDiscountInternal(
    code: string,
    orderTotal: number,
  ): Promise<DiscountCode | null> {
    const discount = await this.discountRepository.findOne({
      where: { code: code.toUpperCase(), is_active: true },
    });

    if (!discount) return null;

    const now = new Date();
    if (discount.starts_at && discount.starts_at > now) return null;
    if (discount.expires_at && discount.expires_at < now) return null;
    if (discount.max_uses && discount.used_count >= discount.max_uses)
      return null;
    if (
      discount.min_order_amount &&
      orderTotal < Number(discount.min_order_amount)
    )
      return null;

    return discount;
  }

  async incrementUsedCount(discount: DiscountCode): Promise<void> {
    discount.used_count += 1;
    await this.discountRepository.save(discount);
  }

  async createDiscount(dto: CreateDiscountDto): Promise<DiscountCode> {
    const discount = this.discountRepository.create({
      code: dto.code.toUpperCase(),
      description: dto.description
        ? this.sanitizeHtml(dto.description)
        : null,
      type: dto.type || DiscountType.PERCENTAGE,
      value: dto.value,
      min_order_amount: dto.min_order_amount || null,
      max_uses: dto.max_uses || null,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    return this.discountRepository.save(discount);
  }

  async findAllDiscounts(): Promise<DiscountCode[]> {
    return this.discountRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async updateDiscount(
    id: string,
    dto: Partial<CreateDiscountDto>,
  ): Promise<DiscountCode> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id "${id}" not found`);
    }

    if (dto.code) discount.code = dto.code.toUpperCase();
    if (dto.description !== undefined)
      discount.description = dto.description ? this.sanitizeHtml(dto.description) : null;
    if (dto.type) discount.type = dto.type;
    if (dto.value !== undefined) discount.value = dto.value;
    if (dto.is_active !== undefined) discount.is_active = dto.is_active;

    return this.discountRepository.save(discount);
  }

  async deleteDiscount(id: string): Promise<void> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new NotFoundException(`Discount with id "${id}" not found`);
    }
    await this.discountRepository.remove(discount);
  }
}
