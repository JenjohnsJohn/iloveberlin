import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiningService } from './dining.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import { CreateDiningOfferDto } from './dto/create-dining-offer.dto';
import { UpdateDiningOfferDto } from './dto/update-dining-offer.dto';
import { AddRestaurantImageDto } from './dto/add-restaurant-image.dto';
import { RestaurantQueryDto } from './dto/restaurant-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('dining')
export class DiningController {
  constructor(private readonly diningService: DiningService) {}

  // ─── Public restaurant endpoints ─────────────────────────

  @Get('restaurants')
  findAllRestaurants(@Query() query: RestaurantQueryDto) {
    return this.diningService.findAllRestaurants(query, true);
  }

  // ─── Public cuisine endpoints ────────────────────────────

  @Get('cuisines/tree')
  findCuisineTree() {
    return this.diningService.findCuisineTree();
  }

  @Get('cuisines')
  findAllCuisines() {
    return this.diningService.findAllCuisines();
  }

  // ─── Public offer endpoints ──────────────────────────────

  @Get('offers')
  findActiveOffers() {
    return this.diningService.findAllActiveOffers();
  }

  // ─── Admin routes (before :slug to avoid capture) ────────

  @Get('restaurants/admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindAll(@Query() query: RestaurantQueryDto) {
    return this.diningService.findAllRestaurants(query, false);
  }

  @Get('restaurants/admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindBySlug(@Param('slug') slug: string) {
    return this.diningService.findRestaurantBySlug(slug, false);
  }

  // ─── Public param route (after admin routes) ─────────────

  @Get('restaurants/:slug')
  findRestaurantBySlug(@Param('slug') slug: string) {
    return this.diningService.findRestaurantBySlug(slug, true);
  }

  // ─── Protected restaurant endpoints ──────────────────────

  @Post('restaurants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createRestaurant(@Body() dto: CreateRestaurantDto) {
    return this.diningService.createRestaurant(dto);
  }

  @Patch('restaurants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateRestaurant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.diningService.updateRestaurant(id, dto);
  }

  @Delete('restaurants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRestaurant(@Param('id', ParseUUIDPipe) id: string) {
    return this.diningService.deleteRestaurant(id);
  }

  // ─── Protected cuisine endpoints ─────────────────────────

  @Post('cuisines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCuisine(@Body() dto: CreateCuisineDto) {
    return this.diningService.createCuisine(dto);
  }

  @Patch('cuisines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCuisine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCuisineDto,
  ) {
    return this.diningService.updateCuisine(id, dto);
  }

  @Delete('cuisines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCuisine(@Param('id', ParseUUIDPipe) id: string) {
    return this.diningService.deleteCuisine(id);
  }

  // ─── Protected offer endpoints ───────────────────────────

  @Post('offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createOffer(@Body() dto: CreateDiningOfferDto) {
    return this.diningService.createDiningOffer(dto);
  }

  @Patch('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDiningOfferDto,
  ) {
    return this.diningService.updateDiningOffer(id, dto);
  }

  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeOffer(@Param('id', ParseUUIDPipe) id: string) {
    return this.diningService.deleteDiningOffer(id);
  }

  // ─── Protected image endpoints ───────────────────────────

  @Post('restaurants/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddRestaurantImageDto,
  ) {
    return this.diningService.addRestaurantImage(id, dto);
  }

  @Delete('restaurants/:id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.diningService.removeRestaurantImage(id, imageId);
  }
}
