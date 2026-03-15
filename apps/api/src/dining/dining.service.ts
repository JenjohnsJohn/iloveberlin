import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, SelectQueryBuilder, DataSource } from 'typeorm';
import { Restaurant, RestaurantStatus } from './entities/restaurant.entity';
import { Cuisine } from './entities/cuisine.entity';
import { RestaurantImage } from './entities/restaurant-image.entity';
import { DiningOffer } from './entities/dining-offer.entity';
import { Media } from '../media/entities/media.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import { CreateDiningOfferDto } from './dto/create-dining-offer.dto';
import { UpdateDiningOfferDto } from './dto/update-dining-offer.dto';
import { AddRestaurantImageDto } from './dto/add-restaurant-image.dto';
import {
  RestaurantQueryDto,
  RestaurantSortField,
  SortOrder,
} from './dto/restaurant-query.dto';
import { generateSlug } from '../common/utils/slug.util';
import { sanitize } from '../common/utils/sanitize.util';

@Injectable()
export class DiningService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Cuisine)
    private readonly cuisineRepository: Repository<Cuisine>,
    @InjectRepository(RestaurantImage)
    private readonly restaurantImageRepository: Repository<RestaurantImage>,
    @InjectRepository(DiningOffer)
    private readonly diningOfferRepository: Repository<DiningOffer>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly dataSource: DataSource,
  ) {}

  private async getCountsByCuisine(): Promise<Map<string, number>> {
    const rows: { cuisine_id: string; count: number }[] = await this.dataSource.query(
      `SELECT rc.cuisine_id, COUNT(DISTINCT r.id)::int AS count
       FROM restaurant_cuisines rc
       JOIN restaurants r ON r.id = rc.restaurant_id
       WHERE r.status = 'published' AND r.deleted_at IS NULL
       GROUP BY rc.cuisine_id`,
    );
    return new Map(rows.map((r) => [r.cuisine_id, r.count]));
  }

  // ─── HTML Sanitization ─────────────────────────────────

  private sanitizeHtml(html: string): string {
    return sanitize(html);
  }

  // ─── FK Validation Helpers ─────────────────────────────

  private async validateFeaturedImage(imageId: string | undefined | null): Promise<void> {
    if (!imageId) return;
    const media = await this.mediaRepository.findOne({ where: { id: imageId } });
    if (!media) {
      throw new BadRequestException(`Media with id "${imageId}" not found`);
    }
  }

  private async validateCuisines(cuisineIds: string[]): Promise<Cuisine[]> {
    if (!cuisineIds || cuisineIds.length === 0) return [];
    const cuisines = await this.cuisineRepository.findBy({ id: In(cuisineIds) });
    if (cuisines.length !== cuisineIds.length) {
      const foundIds = new Set(cuisines.map((c) => c.id));
      const missing = cuisineIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Cuisine IDs not found: ${missing.join(', ')}`);
    }
    return cuisines;
  }

  private async validateMedia(mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new BadRequestException(`Media with id "${mediaId}" not found`);
    }
  }

  // ─── Restaurants CRUD ────────────────────────────────────

  async createRestaurant(dto: CreateRestaurantDto): Promise<Restaurant> {
    const slug = await this.generateUniqueRestaurantSlug(dto.name);

    // Validate FK references
    await this.validateFeaturedImage(dto.featured_image_id);
    if (dto.cuisine_ids && dto.cuisine_ids.length > 0) {
      await this.validateCuisines(dto.cuisine_ids);
    }

    const restaurant = this.restaurantRepository.create({
      name: dto.name,
      slug,
      description: this.sanitizeHtml(dto.description),
      address: dto.address,
      district: dto.district || null,
      latitude: dto.latitude || null,
      longitude: dto.longitude || null,
      phone: dto.phone || null,
      website: dto.website || null,
      email: dto.email || null,
      google_place_id: dto.google_place_id || null,
      price_range: dto.price_range,
      rating: dto.rating || null,
      opening_hours: dto.opening_hours || {},
      featured_image_id: dto.featured_image_id || null,
      status: dto.status || RestaurantStatus.DRAFT,
    });

    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    if (dto.cuisine_ids && dto.cuisine_ids.length > 0) {
      const cuisines = await this.cuisineRepository.findBy({
        id: In(dto.cuisine_ids),
      });
      savedRestaurant.cuisines = cuisines;
      await this.restaurantRepository.save(savedRestaurant);
    }

    return this.findRestaurantById(savedRestaurant.id);
  }

  async findAllRestaurants(
    query: RestaurantQueryDto,
    isPublicOnly = true,
  ): Promise<{ data: Restaurant[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.cuisines', 'cuisine')
      .leftJoinAndSelect('restaurant.featured_image', 'featured_image');

    if (isPublicOnly) {
      qb.andWhere('restaurant.status = :status', {
        status: RestaurantStatus.PUBLISHED,
      });
    }

    // Cuisine filter (includes descendants)
    if (query.cuisine) {
      const cuisineIds = await this.getCuisineAndDescendantIds(query.cuisine);
      if (cuisineIds.length > 0) {
        qb.andWhere('cuisine.id IN (:...cuisineIds)', { cuisineIds });
      } else {
        qb.andWhere('1 = 0');
      }
    }

    // District filter
    if (query.district) {
      qb.andWhere('restaurant.district = :district', {
        district: query.district,
      });
    }

    // Price range filter
    if (query.price_range) {
      qb.andWhere('restaurant.price_range = :priceRange', {
        priceRange: query.price_range,
      });
    }

    // Minimum rating filter
    if (query.rating_min !== undefined) {
      qb.andWhere('restaurant.rating >= :ratingMin', {
        ratingMin: query.rating_min,
      });
    }

    // Search
    if (query.search) {
      qb.andWhere(
        '(restaurant.name ILIKE :search OR restaurant.description ILIKE :search OR restaurant.district ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findRestaurantBySlug(slug: string, publicOnly = true): Promise<Restaurant> {
    const qb = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.cuisines', 'cuisine')
      .leftJoinAndSelect('restaurant.featured_image', 'featured_image')
      .leftJoinAndSelect('restaurant.images', 'images')
      .leftJoinAndSelect('images.media', 'image_media')
      .leftJoinAndSelect('restaurant.offers', 'offers')
      .where('restaurant.slug = :slug', { slug });

    if (publicOnly) {
      qb.andWhere('restaurant.status = :status', {
        status: RestaurantStatus.PUBLISHED,
      });
    }

    const restaurant = await qb.getOne();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug "${slug}" not found`);
    }

    return restaurant;
  }

  async findRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: [
        'cuisines',
        'featured_image',
        'images',
        'images.media',
        'offers',
      ],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found`);
    }

    return restaurant;
  }

  async updateRestaurant(id: string, dto: UpdateRestaurantDto): Promise<Restaurant> {
    const restaurant = await this.findRestaurantById(id);

    // Validate FK references if provided
    if (dto.featured_image_id !== undefined) {
      await this.validateFeaturedImage(dto.featured_image_id);
    }
    if (dto.cuisine_ids !== undefined && dto.cuisine_ids.length > 0) {
      await this.validateCuisines(dto.cuisine_ids);
    }

    if (dto.name !== undefined) restaurant.name = dto.name;
    if (dto.description !== undefined) restaurant.description = this.sanitizeHtml(dto.description);
    if (dto.address !== undefined) restaurant.address = dto.address;
    if (dto.district !== undefined) restaurant.district = dto.district || null;
    if (dto.latitude !== undefined) restaurant.latitude = dto.latitude || null;
    if (dto.longitude !== undefined) restaurant.longitude = dto.longitude || null;
    if (dto.phone !== undefined) restaurant.phone = dto.phone || null;
    if (dto.website !== undefined) restaurant.website = dto.website || null;
    if (dto.email !== undefined) restaurant.email = dto.email || null;
    if (dto.google_place_id !== undefined) restaurant.google_place_id = dto.google_place_id || null;
    if (dto.price_range !== undefined) restaurant.price_range = dto.price_range;
    if (dto.rating !== undefined) restaurant.rating = dto.rating || null;
    if (dto.opening_hours !== undefined) restaurant.opening_hours = dto.opening_hours;
    if (dto.featured_image_id !== undefined)
      restaurant.featured_image_id = dto.featured_image_id || null;
    if (dto.status !== undefined) restaurant.status = dto.status;

    if (dto.cuisine_ids !== undefined) {
      const cuisines = dto.cuisine_ids.length > 0
        ? await this.cuisineRepository.findBy({ id: In(dto.cuisine_ids) })
        : [];
      restaurant.cuisines = cuisines;
    }

    await this.restaurantRepository.save(restaurant);
    return this.findRestaurantById(restaurant.id);
  }

  async deleteRestaurant(id: string): Promise<void> {
    const restaurant = await this.findRestaurantById(id);
    await this.restaurantRepository.softRemove(restaurant);
  }

  // ─── Cuisines CRUD ───────────────────────────────────────

  async createCuisine(dto: CreateCuisineDto): Promise<Cuisine> {
    const slug = await this.generateUniqueCuisineSlug(dto.name);

    const cuisine = this.cuisineRepository.create({
      name: dto.name,
      slug,
      sort_order: dto.sort_order || 0,
    });

    return this.cuisineRepository.save(cuisine);
  }

  async findAllCuisines(): Promise<Cuisine[]> {
    return this.cuisineRepository.find({
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  async findCuisineTree(): Promise<Cuisine[]> {
    const roots = await this.cuisineRepository.find({
      where: { parent_id: IsNull() },
      relations: ['children'],
      order: { sort_order: 'ASC', name: 'ASC' },
    });

    const countsMap = await this.getCountsByCuisine();
    for (const root of roots) {
      let childrenTotal = 0;
      if (root.children) {
        for (const child of root.children) {
          const count = countsMap.get(child.id) || 0;
          (child as any).listing_count = count;
          childrenTotal += count;
        }
      }
      const ownCount = countsMap.get(root.id) || 0;
      (root as any).listing_count = ownCount + childrenTotal;
    }

    return roots;
  }

  private async getCuisineAndDescendantIds(slug: string): Promise<string[]> {
    const cuisine = await this.cuisineRepository.findOne({
      where: { slug },
    });
    if (!cuisine) return [];

    const children = await this.cuisineRepository.find({
      where: { parent_id: cuisine.id },
    });

    return [
      cuisine.id,
      ...children.map((c) => c.id),
    ];
  }

  async findCuisineById(id: string): Promise<Cuisine> {
    const cuisine = await this.cuisineRepository.findOne({
      where: { id },
    });

    if (!cuisine) {
      throw new NotFoundException(`Cuisine with id "${id}" not found`);
    }

    return cuisine;
  }

  async updateCuisine(id: string, dto: UpdateCuisineDto): Promise<Cuisine> {
    const cuisine = await this.findCuisineById(id);

    if (dto.name !== undefined) cuisine.name = dto.name;
    if (dto.sort_order !== undefined) cuisine.sort_order = dto.sort_order;

    return this.cuisineRepository.save(cuisine);
  }

  async deleteCuisine(id: string): Promise<void> {
    const cuisine = await this.findCuisineById(id);
    await this.cuisineRepository.remove(cuisine);
  }

  // ─── Dining Offers CRUD ──────────────────────────────────

  async createDiningOffer(dto: CreateDiningOfferDto): Promise<DiningOffer> {
    // Verify restaurant exists
    await this.findRestaurantById(dto.restaurant_id);

    const offer = this.diningOfferRepository.create({
      restaurant_id: dto.restaurant_id,
      title: dto.title,
      description: dto.description ? this.sanitizeHtml(dto.description) : null,
      start_date: dto.start_date,
      end_date: dto.end_date,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
    });

    const saved = await this.diningOfferRepository.save(offer);
    return this.findDiningOfferById(saved.id);
  }

  async findAllActiveOffers(): Promise<DiningOffer[]> {
    return this.diningOfferRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.restaurant', 'restaurant')
      .leftJoinAndSelect('restaurant.featured_image', 'featured_image')
      .leftJoinAndSelect('restaurant.cuisines', 'cuisine')
      .where('offer.is_active = :active', { active: true })
      .andWhere('offer.end_date >= CURRENT_DATE')
      .andWhere('restaurant.status = :status', {
        status: RestaurantStatus.PUBLISHED,
      })
      .orderBy('offer.end_date', 'ASC')
      .getMany();
  }

  async findDiningOfferById(id: string): Promise<DiningOffer> {
    const offer = await this.diningOfferRepository.findOne({
      where: { id },
      relations: ['restaurant', 'restaurant.cuisines', 'restaurant.featured_image'],
    });

    if (!offer) {
      throw new NotFoundException(`Dining offer with id "${id}" not found`);
    }

    return offer;
  }

  async updateDiningOffer(id: string, dto: UpdateDiningOfferDto): Promise<DiningOffer> {
    const offer = await this.findDiningOfferById(id);

    if (dto.title !== undefined) offer.title = dto.title;
    if (dto.description !== undefined) offer.description = dto.description ? this.sanitizeHtml(dto.description) : null;
    if (dto.start_date !== undefined) offer.start_date = dto.start_date;
    if (dto.end_date !== undefined) offer.end_date = dto.end_date;
    if (dto.is_active !== undefined) offer.is_active = dto.is_active;
    if (dto.restaurant_id !== undefined) {
      await this.findRestaurantById(dto.restaurant_id);
      offer.restaurant_id = dto.restaurant_id;
    }

    // Cross-field validation for dates after partial update
    const finalStartDate = dto.start_date ?? offer.start_date;
    const finalEndDate = dto.end_date ?? offer.end_date;
    if (finalEndDate < finalStartDate) {
      throw new BadRequestException('end_date must be on or after start_date');
    }

    await this.diningOfferRepository.save(offer);
    return this.findDiningOfferById(offer.id);
  }

  async deleteDiningOffer(id: string): Promise<void> {
    const offer = await this.findDiningOfferById(id);
    await this.diningOfferRepository.remove(offer);
  }

  // ─── Restaurant Images ──────────────────────────────────

  async addRestaurantImage(
    restaurantId: string,
    dto: AddRestaurantImageDto,
  ): Promise<RestaurantImage> {
    await this.findRestaurantById(restaurantId);
    await this.validateMedia(dto.media_id);

    const image = this.restaurantImageRepository.create({
      restaurant_id: restaurantId,
      media_id: dto.media_id,
      sort_order: dto.sort_order || 0,
      caption: dto.caption || null,
    });

    return this.restaurantImageRepository.save(image);
  }

  async removeRestaurantImage(
    restaurantId: string,
    imageId: string,
  ): Promise<void> {
    const image = await this.restaurantImageRepository.findOne({
      where: { id: imageId, restaurant_id: restaurantId },
    });

    if (!image) {
      throw new NotFoundException(
        `Image with id "${imageId}" not found for restaurant "${restaurantId}"`,
      );
    }

    await this.restaurantImageRepository.remove(image);
  }

  // ─── Private helpers ─────────────────────────────────────

  private applySorting(
    qb: SelectQueryBuilder<Restaurant>,
    sort?: RestaurantSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.DESC ? 'DESC' : 'ASC';

    switch (sort) {
      case RestaurantSortField.RATING:
        qb.orderBy('restaurant.rating', direction);
        break;
      case RestaurantSortField.CREATED:
        qb.orderBy('restaurant.created_at', direction);
        break;
      case RestaurantSortField.PRICE:
        qb.orderBy('restaurant.price_range', direction);
        break;
      case RestaurantSortField.NAME:
      default:
        qb.orderBy('restaurant.name', direction);
        break;
    }
  }

  private async generateUniqueRestaurantSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.restaurantRepository.findOne({
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

  private async generateUniqueCuisineSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.cuisineRepository.findOne({
        where: { slug },
      });
      if (!existing) {
        return slug;
      }
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }
  }
}
