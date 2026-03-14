import {
  Controller,
  Get,
  Post,
  Put,
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
import { ClassifiedsService } from './classifieds.service';
import { CreateClassifiedDto } from './dto/create-classified.dto';
import { UpdateClassifiedDto } from './dto/update-classified.dto';
import { CreateClassifiedCategoryDto } from './dto/create-classified-category.dto';
import { UpdateClassifiedCategoryDto } from './dto/update-classified-category.dto';
import { ClassifiedQueryDto } from './dto/classified-query.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ClassifiedReportStatus } from './entities/classified-report.entity';
import { CategoryFieldDefinition } from './interfaces/category-field.interface';

@Controller('classifieds')
export class ClassifiedsController {
  constructor(private readonly classifiedsService: ClassifiedsService) {}

  // ─── Static / named routes FIRST ───────────────────────

  @Get('categories')
  getCategories() {
    return this.classifiedsService.findAllCategories();
  }

  @Get('categories/tree')
  getCategoryTree() {
    return this.classifiedsService.findCategoryTree();
  }

  @Get('categories/:slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.classifiedsService.findCategoryBySlug(slug);
  }

  @Get()
  findAll(@Query() query: ClassifiedQueryDto) {
    return this.classifiedsService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClassifiedDto,
  ) {
    return this.classifiedsService.create(userId, dto);
  }

  // ─── User named routes (before :slug) ──────────────────

  @Get('user/my-listings')
  @UseGuards(JwtAuthGuard)
  myListings(@CurrentUser('id') userId: string) {
    return this.classifiedsService.findMyListings(userId);
  }

  // ─── Messages named routes (before :slug) ──────────────

  @Get('messages/conversations')
  @UseGuards(JwtAuthGuard)
  getConversations(@CurrentUser('id') userId: string) {
    return this.classifiedsService.getConversations(userId);
  }

  @Get('messages/:classifiedId')
  @UseGuards(JwtAuthGuard)
  getThread(
    @Param('classifiedId', ParseUUIDPipe) classifiedId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classifiedsService.getThread(classifiedId, userId);
  }

  // ─── Admin named routes (before :slug) ─────────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllAdmin(@Query() query: ClassifiedQueryDto) {
    return this.classifiedsService.findAllAdmin(query);
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAdminCategories() {
    return this.classifiedsService.findAllCategoriesAdmin();
  }

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createCategory(@Body() dto: CreateClassifiedCategoryDto) {
    return this.classifiedsService.createCategory(dto);
  }

  @Patch('admin/categories/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  reorderCategories(@Body() body: { items: { id: string; sort_order: number }[] }) {
    return this.classifiedsService.reorderCategories(body.items);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassifiedCategoryDto,
  ) {
    return this.classifiedsService.updateCategoryAdmin(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.classifiedsService.deleteCategoryAdmin(id);
  }

  @Get('admin/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getReports() {
    return this.classifiedsService.findAllReports();
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindBySlug(@Param('slug') slug: string) {
    return this.classifiedsService.findBySlug(slug, false);
  }

  @Put('admin/categories/:id/schema')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCategorySchema(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { schema: CategoryFieldDefinition[] },
  ) {
    return this.classifiedsService.updateCategorySchema(id, body.schema);
  }

  @Put('admin/reports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: ClassifiedReportStatus; admin_notes?: string },
  ) {
    return this.classifiedsService.updateReport(
      id,
      body.status,
      body.admin_notes,
    );
  }

  // ─── Parameterized UUID routes ─────────────────────────

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: UpdateClassifiedDto,
  ) {
    return this.classifiedsService.update(id, userId, dto, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.classifiedsService.delete(id, userId, userRole);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { url: string; thumbnail_url?: string },
  ) {
    return this.classifiedsService.addImage(
      id,
      userId,
      body.url,
      body.thumbnail_url,
    );
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classifiedsService.removeImage(id, imageId, userId);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submitForModeration(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.classifiedsService.submitForModeration(id, userId);
  }

  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  moderate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { action: 'approve' | 'reject'; moderator_notes?: string },
  ) {
    return this.classifiedsService.moderate(
      id,
      body.action,
      body.moderator_notes,
    );
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.classifiedsService.sendMessage(id, userId, dto);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  createReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.classifiedsService.createReport(id, userId, dto);
  }

  // ─── Public :slug route LAST ───────────────────────────

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.classifiedsService.findBySlug(slug);
  }
}
