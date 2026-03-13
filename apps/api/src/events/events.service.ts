import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { Venue } from './entities/venue.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import {
  EventQueryDto,
  EventSortField,
  SortOrder,
  DateFilter,
} from './dto/event-query.dto';
import { generateSlug } from '../common/utils/slug.util';

@Injectable()
export class EventsService {
  private readonly recentViews = new Map<string, number>();

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Venue)
    private readonly venueRepository: Repository<Venue>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // ─── Events CRUD ───────────────────────────────────────────

  async createEvent(dto: CreateEventDto, userId: string): Promise<Event> {
    // Validate FK references
    if (dto.venue_id) {
      const venue = await this.venueRepository.findOne({ where: { id: dto.venue_id } });
      if (!venue) {
        throw new BadRequestException(`Venue with id "${dto.venue_id}" not found`);
      }
    }
    if (dto.category_id) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.category_id } });
      if (!category) {
        throw new BadRequestException(`Category with id "${dto.category_id}" not found`);
      }
    }

    const slug = await this.generateUniqueEventSlug(dto.title);
    const sanitizedDescription = this.sanitizeHtml(dto.description);

    const event = this.eventRepository.create({
      title: dto.title,
      slug,
      description: sanitizedDescription,
      excerpt: dto.excerpt || null,
      venue_id: dto.venue_id || null,
      category_id: dto.category_id || null,
      start_date: dto.start_date,
      end_date: dto.end_date || null,
      start_time: dto.start_time || null,
      end_time: dto.end_time || null,
      is_recurring: dto.is_recurring || false,
      rrule: dto.rrule || null,
      is_free: dto.is_free !== undefined ? dto.is_free : true,
      price: dto.price || null,
      price_max: dto.price_max || null,
      ticket_url: dto.ticket_url || null,
      featured_image_id: dto.featured_image_id || null,
      status: dto.status || EventStatus.DRAFT,
      submitted_by: userId,
    });

    if (event.status === EventStatus.PUBLISHED) {
      event.published_at = new Date();
    }

    const savedEvent = await this.eventRepository.save(event);
    return this.findEventById(savedEvent.id);
  }

  async submitEvent(dto: CreateEventDto, userId: string): Promise<Event> {
    // Community submission - always starts as PENDING
    dto.status = EventStatus.PENDING;
    return this.createEvent(dto, userId);
  }

  async findAllEvents(
    query: EventQueryDto,
    isPublicOnly = true,
  ): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.featured_image', 'featured_image');

    if (isPublicOnly) {
      // Public: only select safe submitter fields
      qb.leftJoin('event.submitter', 'submitter')
        .addSelect(['submitter.id', 'submitter.display_name', 'submitter.avatar_url']);
      qb.andWhere('event.status = :status', {
        status: EventStatus.PUBLISHED,
      });
    } else {
      qb.leftJoinAndSelect('event.submitter', 'submitter')
        .leftJoinAndSelect('event.approver', 'approver');
      if (query.status) {
        qb.andWhere('event.status = :status', { status: query.status });
      }
    }

    // Date filter shortcuts
    if (query.date_filter) {
      this.applyDateFilter(qb, query.date_filter);
    } else {
      // Custom date range - handles multi-day events
      if (query.date_from && query.date_to) {
        qb.andWhere(
          '(event.start_date <= :dateTo AND (event.end_date >= :dateFrom OR (event.end_date IS NULL AND event.start_date >= :dateFrom)))',
          { dateFrom: query.date_from, dateTo: query.date_to },
        );
      } else if (query.date_from) {
        qb.andWhere(
          '(event.end_date >= :dateFrom OR (event.end_date IS NULL AND event.start_date >= :dateFrom))',
          { dateFrom: query.date_from },
        );
      } else if (query.date_to) {
        qb.andWhere('event.start_date <= :dateTo', {
          dateTo: query.date_to,
        });
      }
    }

    // Category filter
    if (query.category) {
      qb.andWhere('category.slug = :categorySlug', {
        categorySlug: query.category,
      });
    }

    // District filter
    if (query.district) {
      qb.andWhere('venue.district = :district', {
        district: query.district,
      });
    }

    // Free/paid filter
    if (query.is_free !== undefined) {
      qb.andWhere('event.is_free = :isFree', { isFree: query.is_free });
    }

    // Search
    if (query.search) {
      qb.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search OR event.excerpt ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    this.applySorting(qb, query.sort, query.order);

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit };
  }

  async findEventBySlug(slug: string, publicOnly = true): Promise<Event> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.featured_image', 'featured_image')
      .where('event.slug = :slug', { slug });

    if (publicOnly) {
      qb.leftJoin('event.submitter', 'submitter')
        .addSelect(['submitter.id', 'submitter.display_name', 'submitter.avatar_url']);
      qb.andWhere('event.status = :status', { status: EventStatus.PUBLISHED });
    } else {
      qb.leftJoinAndSelect('event.submitter', 'submitter')
        .leftJoinAndSelect('event.approver', 'approver');
    }

    const event = await qb.getOne();

    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }

    return event;
  }

  async findEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: [
        'venue',
        'category',
        'featured_image',
        'submitter',
        'approver',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findEventById(id);

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = this.sanitizeHtml(dto.description);
    if (dto.excerpt !== undefined) event.excerpt = dto.excerpt || null;
    if (dto.venue_id !== undefined) event.venue_id = dto.venue_id || null;
    if (dto.category_id !== undefined)
      event.category_id = dto.category_id || null;
    if (dto.start_date !== undefined) event.start_date = dto.start_date;
    if (dto.end_date !== undefined) event.end_date = dto.end_date || null;
    if (dto.start_time !== undefined)
      event.start_time = dto.start_time || null;
    if (dto.end_time !== undefined) event.end_time = dto.end_time || null;
    if (dto.is_recurring !== undefined) event.is_recurring = dto.is_recurring;
    if (dto.rrule !== undefined) event.rrule = dto.rrule || null;
    if (dto.is_free !== undefined) event.is_free = dto.is_free;
    if (dto.price !== undefined) event.price = dto.price || null;
    if (dto.price_max !== undefined) event.price_max = dto.price_max || null;
    if (dto.ticket_url !== undefined)
      event.ticket_url = dto.ticket_url || null;
    if (dto.featured_image_id !== undefined)
      event.featured_image_id = dto.featured_image_id || null;

    await this.eventRepository.save(event);
    return this.findEventById(event.id);
  }

  async updateEventStatus(
    id: string,
    newStatus: EventStatus,
    userId?: string,
  ): Promise<Event> {
    const event = await this.findEventById(id);

    this.validateStatusTransition(event.status, newStatus);

    event.status = newStatus;

    if (newStatus === EventStatus.PUBLISHED && !event.published_at) {
      event.published_at = new Date();
    }

    if (
      (newStatus === EventStatus.APPROVED ||
        newStatus === EventStatus.PUBLISHED) &&
      userId
    ) {
      event.approved_by = userId;
    }

    await this.eventRepository.save(event);
    return this.findEventById(event.id);
  }

  async incrementViewCount(id: string, clientIp?: string): Promise<void> {
    if (clientIp) {
      const key = `${id}:${clientIp}`;
      const lastView = this.recentViews.get(key);
      const now = Date.now();
      if (lastView && now - lastView < 5 * 60 * 1000) {
        return;
      }
      this.recentViews.set(key, now);
      if (this.recentViews.size > 10000) {
        const cutoff = now - 5 * 60 * 1000;
        for (const [k, v] of this.recentViews) {
          if (v < cutoff) this.recentViews.delete(k);
        }
      }
    }
    await this.eventRepository.increment({ id }, 'view_count', 1);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.findEventById(id);
    await this.eventRepository.softRemove(event);
  }

  async findRelatedEvents(eventId: string, limit = 4): Promise<Event[]> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with id "${eventId}" not found`);
    }

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.featured_image', 'featured_image')
      .where('event.id != :eventId', { eventId })
      .andWhere('event.status = :status', {
        status: EventStatus.PUBLISHED,
      })
      .andWhere(
        '(event.end_date >= CURRENT_DATE OR (event.end_date IS NULL AND event.start_date >= CURRENT_DATE))',
      );

    if (event.category_id) {
      qb.andWhere('event.category_id = :categoryId', {
        categoryId: event.category_id,
      });
    }

    qb.orderBy('event.start_date', 'ASC').take(limit);

    return qb.getMany();
  }

  async archivePastEvents(): Promise<number> {
    const result = await this.eventRepository
      .createQueryBuilder()
      .update(Event)
      .set({ status: EventStatus.ARCHIVED })
      .where('status = :status', { status: EventStatus.PUBLISHED })
      .andWhere(
        '(end_date IS NOT NULL AND end_date < CURRENT_DATE) OR (end_date IS NULL AND start_date < CURRENT_DATE)',
      )
      .execute();

    return result.affected || 0;
  }

  // ─── Venues CRUD ───────────────────────────────────────────

  async createVenue(dto: CreateVenueDto): Promise<Venue> {
    const slug = await this.generateUniqueVenueSlug(dto.name);

    const venue = this.venueRepository.create({
      name: dto.name,
      slug,
      address: dto.address,
      district: dto.district || null,
      latitude: dto.latitude || null,
      longitude: dto.longitude || null,
      website: dto.website || null,
      phone: dto.phone || null,
      capacity: dto.capacity || null,
      description: dto.description || null,
    });

    return this.venueRepository.save(venue);
  }

  async findAllVenues(): Promise<Venue[]> {
    return this.venueRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findVenueById(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundException(`Venue with id "${id}" not found`);
    }

    return venue;
  }

  async updateVenue(id: string, dto: UpdateVenueDto): Promise<Venue> {
    const venue = await this.findVenueById(id);

    if (dto.name !== undefined) venue.name = dto.name;
    if (dto.address !== undefined) venue.address = dto.address;
    if (dto.district !== undefined) venue.district = dto.district || null;
    if (dto.latitude !== undefined) venue.latitude = dto.latitude || null;
    if (dto.longitude !== undefined) venue.longitude = dto.longitude || null;
    if (dto.website !== undefined) venue.website = dto.website || null;
    if (dto.phone !== undefined) venue.phone = dto.phone || null;
    if (dto.capacity !== undefined) venue.capacity = dto.capacity || null;
    if (dto.description !== undefined)
      venue.description = dto.description || null;

    return this.venueRepository.save(venue);
  }

  async deleteVenue(id: string): Promise<void> {
    const venue = await this.findVenueById(id);

    // Check for future events at this venue
    const futureEventCount = await this.eventRepository.count({
      where: { venue_id: id },
    });

    if (futureEventCount > 0) {
      throw new BadRequestException(
        `Cannot delete venue "${venue.name}" - it has ${futureEventCount} associated event(s). Reassign or delete them first.`,
      );
    }

    await this.venueRepository.softRemove(venue);
  }

  // ─── Private helpers ───────────────────────────────────────

  private sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/<iframe\b[^>]*\bsrcdoc\s*=/gi, '<iframe ')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*\/?>/gi, '');
  }

  private applyDateFilter(
    qb: SelectQueryBuilder<Event>,
    dateFilter: DateFilter,
  ): void {
    const now = new Date();

    switch (dateFilter) {
      case DateFilter.TODAY:
        // Include multi-day events that are still running today
        qb.andWhere(
          '(event.start_date <= CURRENT_DATE AND (event.end_date >= CURRENT_DATE OR (event.end_date IS NULL AND event.start_date = CURRENT_DATE)))',
        );
        break;

      case DateFilter.WEEKEND: {
        const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
        let saturday: Date;

        if (dayOfWeek === 6) {
          // It's Saturday - use today
          saturday = new Date(now);
        } else if (dayOfWeek === 0) {
          // It's Sunday - use yesterday (Saturday) so we include both Sat + Sun
          saturday = new Date(now);
          saturday.setDate(now.getDate() - 1);
        } else {
          // Weekday - next Saturday
          const daysUntilSaturday = 6 - dayOfWeek;
          saturday = new Date(now);
          saturday.setDate(now.getDate() + daysUntilSaturday);
        }

        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        const satStr = saturday.toISOString().split('T')[0];
        const sunStr = sunday.toISOString().split('T')[0];

        // Include multi-day events overlapping the weekend
        qb.andWhere(
          '(event.start_date <= :sunStr AND (event.end_date >= :satStr OR (event.end_date IS NULL AND event.start_date >= :satStr)))',
          { satStr, sunStr },
        );
        break;
      }

      case DateFilter.WEEK: {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + 7);
        const todayStr = now.toISOString().split('T')[0];
        const weekEndStr = weekEnd.toISOString().split('T')[0];
        qb.andWhere(
          '(event.start_date <= :weekEndStr AND (event.end_date >= :todayStr OR (event.end_date IS NULL AND event.start_date >= :todayStr)))',
          { todayStr, weekEndStr },
        );
        break;
      }

      case DateFilter.MONTH: {
        const monthEnd = new Date(now);
        monthEnd.setDate(now.getDate() + 30);
        const todayStr = now.toISOString().split('T')[0];
        const monthEndStr = monthEnd.toISOString().split('T')[0];
        qb.andWhere(
          '(event.start_date <= :monthEndStr AND (event.end_date >= :todayStr OR (event.end_date IS NULL AND event.start_date >= :todayStr)))',
          { todayStr, monthEndStr },
        );
        break;
      }
    }
  }

  private applySorting(
    qb: SelectQueryBuilder<Event>,
    sort?: EventSortField,
    order?: SortOrder,
  ): void {
    const direction = order === SortOrder.DESC ? 'DESC' : 'ASC';

    switch (sort) {
      case EventSortField.TITLE:
        qb.orderBy('event.title', direction);
        break;
      case EventSortField.CREATED:
        qb.orderBy('event.created_at', direction);
        break;
      case EventSortField.DATE:
      default:
        qb.orderBy('event.start_date', direction);
        qb.addOrderBy('event.start_time', direction);
        break;
    }
  }

  private validateStatusTransition(
    currentStatus: EventStatus,
    newStatus: EventStatus,
  ): void {
    const allowedTransitions: Record<EventStatus, EventStatus[]> = {
      [EventStatus.DRAFT]: [EventStatus.PENDING],
      [EventStatus.PENDING]: [
        EventStatus.DRAFT,
        EventStatus.APPROVED,
        EventStatus.PUBLISHED,
      ],
      [EventStatus.APPROVED]: [EventStatus.PUBLISHED, EventStatus.DRAFT],
      [EventStatus.PUBLISHED]: [EventStatus.CANCELLED, EventStatus.ARCHIVED],
      [EventStatus.CANCELLED]: [EventStatus.DRAFT],
      [EventStatus.ARCHIVED]: [EventStatus.DRAFT],
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${currentStatus}" to "${newStatus}"`,
      );
    }
  }

  private async generateUniqueEventSlug(title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.eventRepository.findOne({
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

  private async generateUniqueVenueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const existing = await this.venueRepository.findOne({
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
