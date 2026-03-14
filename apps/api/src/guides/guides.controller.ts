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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { GuidesService } from './guides.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('guides')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  // ── Public Guide Routes ─────────────────────────────────

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.guidesService.findAll(true, page, limit);
  }

  @Get('topics/tree')
  findTopicTree() {
    return this.guidesService.findTopicTree();
  }

  @Get('topics')
  findAllTopics() {
    return this.guidesService.findAllTopics();
  }

  @Get('topics/:slug')
  async findTopicBySlug(@Param('slug') slug: string) {
    const topic = await this.guidesService.findTopicBySlug(slug);
    const guides = await this.guidesService.findByTopic(slug);
    return { ...topic, guides };
  }

  // ── Admin Guide Routes (must precede :slug) ─────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('topic') topic?: string,
    @Query('status') status?: string,
  ) {
    return this.guidesService.findAll(false, page, limit, topic, status);
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findBySlugAdmin(@Param('slug') slug: string) {
    const guide = await this.guidesService.findBySlug(slug, false);
    const toc = this.guidesService.generateTableOfContents(guide.body);
    return { ...guide, toc };
  }

  // ── Public :slug (after admin routes) ───────────────────

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const guide = await this.guidesService.findBySlug(slug);
    const toc = this.guidesService.generateTableOfContents(guide.body);
    return { ...guide, toc };
  }

  // ── Protected Guide Routes (editor+) ───────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(
    @Body() dto: CreateGuideDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.guidesService.create(dto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuideDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.guidesService.update(id, dto, userId, userRole);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.guidesService.delete(id, userId, userRole);
  }

  // ── Protected Topic Routes (admin) ─────────────────────

  @Post('topics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createTopic(@Body() dto: CreateTopicDto) {
    return this.guidesService.createTopic(dto);
  }

  @Patch('topics/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateTopic(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.guidesService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTopic(@Param('id', ParseUUIDPipe) id: string) {
    return this.guidesService.deleteTopic(id);
  }
}
