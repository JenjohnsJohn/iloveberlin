import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { EventQueryDto, DateFilter } from './dto/event-query.dto';
import { EventStatus } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ─── Static routes MUST be before :slug param route ────────

  @Get()
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAllEvents(query, true);
  }

  @Get('today')
  findToday(@Query() query: EventQueryDto) {
    query.date_filter = DateFilter.TODAY;
    return this.eventsService.findAllEvents(query, true);
  }

  @Get('weekend')
  findWeekend(@Query() query: EventQueryDto) {
    query.date_filter = DateFilter.WEEKEND;
    return this.eventsService.findAllEvents(query, true);
  }

  // Venue routes (before :slug to avoid capture)
  @Get('venues/list')
  findAllVenues() {
    return this.eventsService.findAllVenues();
  }

  // Admin routes (before :slug to avoid capture)
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAllEvents(query, false);
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindBySlug(@Param('slug') slug: string) {
    return this.eventsService.findEventBySlug(slug, false);
  }

  // Related events (before :slug to avoid capture - uses UUID)
  @Get(':id/related')
  findRelated(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findRelatedEvents(id);
  }

  // ─── Public param routes ───────────────────────────────────

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findEventBySlug(slug, true);
  }

  @Post(':slug/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Param('slug') slug: string, @Req() req: Request) {
    const event = await this.eventsService.findEventBySlug(slug, true);
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    await this.eventsService.incrementViewCount(event.id, clientIp);
  }

  // ─── Protected event endpoints ──────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.createEvent(dto, userId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.submitEvent(dto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: EventStatus,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.updateEventStatus(id, status, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.deleteEvent(id);
  }

  // ─── Venue endpoints ────────────────────────────────────

  @Post('venues')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createVenue(@Body() dto: CreateVenueDto) {
    return this.eventsService.createVenue(dto);
  }

  @Patch('venues/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateVenue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVenueDto,
  ) {
    return this.eventsService.updateVenue(id, dto);
  }

  @Delete('venues/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVenue(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.deleteVenue(id);
  }
}
