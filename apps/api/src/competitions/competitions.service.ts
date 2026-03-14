import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Competition, CompetitionStatus } from './entities/competition.entity';
import { CompetitionEntry } from './entities/competition-entry.entity';
import { Category } from '../categories/entities/category.entity';
import { Media } from '../media/entities/media.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { EnterCompetitionDto } from './dto/enter-competition.dto';
import {
  CompetitionQueryDto,
  CompetitionSortField,
  SortOrder,
} from './dto/competition-query.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class CompetitionsService {
  constructor(
    @InjectRepository(Competition)
    private readonly competitionRepository: Repository<Competition>,
    @InjectRepository(CompetitionEntry)
    private readonly entryRepository: Repository<CompetitionEntry>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  // ─── Sanitization ───────────────────────────────────────

  private sanitizeHtml(input: string): string {
    let text = input;
    text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<iframe[\s\S]*?srcdoc[\s\S]*?>/gi, '');
    text = text.replace(/<object[\s\S]*?<\/object>/gi, '');
    text = text.replace(/<embed[\s\S]*?>/gi, '');
    text = text.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    text = text.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
    text = text.replace(/javascript\s*:/gi, '');
    return text;
  }

  // ─── FK Validation ──────────────────────────────────────

  private async validateFeaturedImage(imageId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id: imageId } });
    if (!media) {
      throw new BadRequestException(`Media with id "${imageId}" not found`);
    }
  }

  // ─── Competitions CRUD ────────────────────────────────────

  async create(dto: CreateCompetitionDto): Promise<Competition> {
    if (dto.featured_image_id) {
      await this.validateFeaturedImage(dto.featured_image_id);
    }

    const slug = await this.generateUniqueSlug(dto.title);

    if (dto.category_id) {
      const cat = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
      if (!cat) {
        throw new BadRequestException(`Category with id "${dto.category_id}" not found`);
      }
    }

    const competition = this.competitionRepository.create({
      title: this.sanitizeHtml(dto.title),
      slug,
      description: this.sanitizeHtml(dto.description),
      prize_description: dto.prize_description
        ? this.sanitizeHtml(dto.prize_description)
        : null,
      featured_image_id: dto.featured_image_id || null,
      category_id: dto.category_id || null,
      start_date: new Date(dto.start_date),
      end_date: new Date(dto.end_date),
      status: dto.status || CompetitionStatus.DRAFT,
      terms_conditions: dto.terms_conditions
        ? this.sanitizeHtml(dto.terms_conditions)
        : null,
      max_entries: dto.max_entries || null,
    });

    const saved = await this.competitionRepository.save(competition);
    return this.findById(saved.id);
  }

  async findAll(
    query: CompetitionQueryDto,
  ): Promise<{ data: Competition[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.competitionRepository
      .createQueryBuilder('competition')
      .leftJoinAndSelect('competition.featured_image', 'featured_image')
      .leftJoinAndSelect('competition.winner', 'winner')
      .leftJoinAndSelect('competition.category', 'category')
      .loadRelationCountAndMap('competition.entry_count', 'competition.entries');

    if (query.status) {
      qb.andWhere('competition.status = :status', { status: query.status });
    }

    if (query.category) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug: query.category });
    }

    if (query.search) {
      qb.andWhere(
        '(competition.title ILIKE :search OR competition.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findActive(
    page = 1,
    limit = 20,
  ): Promise<{ data: Competition[]; total: number; page: number; limit: number }> {
    const qb = this.competitionRepository
      .createQueryBuilder('competition')
      .leftJoinAndSelect('competition.featured_image', 'featured_image')
      .leftJoinAndSelect('competition.category', 'category')
      .loadRelationCountAndMap('competition.entry_count', 'competition.entries')
      .where('competition.status = :status', {
        status: CompetitionStatus.ACTIVE,
      })
      .andWhere('competition.end_date > :now', { now: new Date() })
      .orderBy('competition.end_date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findArchive(
    page = 1,
    limit = 20,
  ): Promise<{ data: Competition[]; total: number; page: number; limit: number }> {
    const qb = this.competitionRepository
      .createQueryBuilder('competition')
      .leftJoinAndSelect('competition.featured_image', 'featured_image')
      .leftJoinAndSelect('competition.category', 'category')
      .leftJoin('competition.winner', 'winner')
      .addSelect(['winner.id', 'winner.display_name'])
      .loadRelationCountAndMap('competition.entry_count', 'competition.entries')
      .where('competition.status IN (:...statuses)', {
        statuses: [CompetitionStatus.CLOSED, CompetitionStatus.ARCHIVED],
      })
      .orderBy('competition.end_date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findBySlug(slug: string, publicOnly = true): Promise<Competition> {
    const qb = this.competitionRepository
      .createQueryBuilder('competition')
      .leftJoinAndSelect('competition.featured_image', 'featured_image')
      .leftJoin('competition.winner', 'winner')
      .addSelect(['winner.id', 'winner.display_name'])
      .loadRelationCountAndMap('competition.entry_count', 'competition.entries')
      .where('competition.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('competition.status IN (:...statuses)', {
        statuses: [CompetitionStatus.ACTIVE, CompetitionStatus.CLOSED, CompetitionStatus.ARCHIVED],
      });
    }

    const competition = await qb.getOne();

    if (!competition) {
      throw new NotFoundException(
        `Competition with slug "${slug}" not found`,
      );
    }

    return competition;
  }

  async findById(id: string): Promise<Competition> {
    const competition = await this.competitionRepository
      .createQueryBuilder('competition')
      .leftJoinAndSelect('competition.featured_image', 'featured_image')
      .leftJoinAndSelect('competition.winner', 'winner')
      .loadRelationCountAndMap('competition.entry_count', 'competition.entries')
      .where('competition.id = :id', { id })
      .getOne();

    if (!competition) {
      throw new NotFoundException(
        `Competition with id "${id}" not found`,
      );
    }

    return competition;
  }

  async update(id: string, dto: UpdateCompetitionDto): Promise<Competition> {
    const competition = await this.findById(id);

    if (dto.featured_image_id) {
      await this.validateFeaturedImage(dto.featured_image_id);
    }

    if (dto.title !== undefined) competition.title = this.sanitizeHtml(dto.title);
    if (dto.description !== undefined)
      competition.description = this.sanitizeHtml(dto.description);
    if (dto.prize_description !== undefined)
      competition.prize_description = dto.prize_description
        ? this.sanitizeHtml(dto.prize_description)
        : null;
    if (dto.featured_image_id !== undefined)
      competition.featured_image_id = dto.featured_image_id || null;
    if (dto.start_date !== undefined)
      competition.start_date = new Date(dto.start_date);
    if (dto.end_date !== undefined)
      competition.end_date = new Date(dto.end_date);
    if (dto.status !== undefined) {
      this.validateStatusTransition(competition.status, dto.status);
      competition.status = dto.status;
    }
    if (dto.terms_conditions !== undefined)
      competition.terms_conditions = dto.terms_conditions
        ? this.sanitizeHtml(dto.terms_conditions)
        : null;
    if (dto.max_entries !== undefined)
      competition.max_entries = dto.max_entries || null;

    await this.competitionRepository.save(competition);
    return this.findById(competition.id);
  }

  async delete(id: string): Promise<void> {
    const competition = await this.findById(id);
    await this.competitionRepository.softRemove(competition);
  }

  // ─── Entry management ─────────────────────────────────────

  async enter(
    competitionId: string,
    userId: string,
    dto: EnterCompetitionDto,
  ): Promise<CompetitionEntry> {
    const competition = await this.findById(competitionId);

    if (competition.status !== CompetitionStatus.ACTIVE) {
      throw new BadRequestException('This competition is not currently active');
    }

    if (new Date() > competition.end_date) {
      throw new BadRequestException('This competition has ended');
    }

    if (competition.max_entries) {
      const entryCount = await this.entryRepository.count({
        where: { competition_id: competitionId },
      });
      if (entryCount >= competition.max_entries) {
        throw new BadRequestException(
          'This competition has reached its maximum number of entries',
        );
      }
    }

    const existingEntry = await this.entryRepository.findOne({
      where: { competition_id: competitionId, user_id: userId },
    });

    if (existingEntry) {
      throw new ConflictException(
        'You have already entered this competition',
      );
    }

    const entry = this.entryRepository.create({
      competition_id: competitionId,
      user_id: userId,
      entry_data: dto.entry_data || {},
    });

    return this.entryRepository.save(entry);
  }

  async getEntries(competitionId: string): Promise<CompetitionEntry[]> {
    await this.findById(competitionId);

    return this.entryRepository.find({
      where: { competition_id: competitionId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getMyEntries(userId: string): Promise<CompetitionEntry[]> {
    return this.entryRepository.find({
      where: { user_id: userId },
      relations: ['competition', 'competition.featured_image'],
      order: { created_at: 'DESC' },
    });
  }

  // ─── Winner selection ──────────────────────────────────────

  async selectWinner(competitionId: string): Promise<Competition> {
    const competition = await this.findById(competitionId);

    if (
      competition.status !== CompetitionStatus.ACTIVE &&
      competition.status !== CompetitionStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Can only select a winner for active or closed competitions',
      );
    }

    const entries = await this.entryRepository.find({
      where: { competition_id: competitionId },
    });

    if (entries.length === 0) {
      throw new BadRequestException(
        'No entries found for this competition',
      );
    }

    const { randomInt } = await import('crypto');
    const randomIndex = randomInt(0, entries.length);
    const winnerEntry = entries[randomIndex];

    competition.winner_id = winnerEntry.user_id;
    competition.winner_selected_at = new Date();
    competition.status = CompetitionStatus.CLOSED;

    await this.competitionRepository.save(competition);
    return this.findById(competition.id);
  }

  // ─── Auto-close expired ───────────────────────────────────

  async closeExpiredCompetitions(): Promise<number> {
    const result = await this.competitionRepository
      .createQueryBuilder()
      .update(Competition)
      .set({ status: CompetitionStatus.CLOSED })
      .where('status = :status', { status: CompetitionStatus.ACTIVE })
      .andWhere('end_date < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  // ─── Private helpers ──────────────────────────────────────

  private applySorting(
    qb: SelectQueryBuilder<Competition>,
    sort?: CompetitionSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.DESC ? 'DESC' : 'ASC';

    switch (sort) {
      case CompetitionSortField.TITLE:
        qb.orderBy('competition.title', direction);
        break;
      case CompetitionSortField.CREATED:
        qb.orderBy('competition.created_at', direction);
        break;
      case CompetitionSortField.DATE:
      default:
        qb.orderBy('competition.end_date', direction);
        break;
    }
  }

  private validateStatusTransition(
    currentStatus: CompetitionStatus,
    newStatus: CompetitionStatus,
  ): void {
    const allowedTransitions: Record<CompetitionStatus, CompetitionStatus[]> = {
      [CompetitionStatus.DRAFT]: [CompetitionStatus.ACTIVE],
      [CompetitionStatus.ACTIVE]: [CompetitionStatus.CLOSED],
      [CompetitionStatus.CLOSED]: [CompetitionStatus.ARCHIVED, CompetitionStatus.DRAFT],
      [CompetitionStatus.ARCHIVED]: [CompetitionStatus.DRAFT],
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${newStatus}"`,
      );
    }
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.competitionRepository.findOne({
        where: { slug },
        withDeleted: true,
      });
      if (!existing) {
        return slug;
      }
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }
  }
}
