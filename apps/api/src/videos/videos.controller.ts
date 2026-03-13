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
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoSeriesDto } from './dto/create-video-series.dto';
import { UpdateVideoSeriesDto } from './dto/update-video-series.dto';
import { VideoQueryDto } from './dto/video-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // ─── Public endpoints ─────────────────────────────────

  @Get()
  findAll(@Query() query: VideoQueryDto) {
    return this.videosService.findAllVideos(query, true);
  }

  @Get('series')
  findAllSeries() {
    return this.videosService.findAllSeries();
  }

  @Get('series/:slug')
  findSeriesBySlug(@Param('slug') slug: string) {
    return this.videosService.findSeriesBySlug(slug);
  }

  @Get(':id/related')
  findRelated(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.findRelatedVideos(id);
  }

  // ─── Admin video endpoints (before :slug) ─────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllAdmin(@Query() query: VideoQueryDto) {
    return this.videosService.findAllVideos(query, false);
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findBySlugAdmin(@Param('slug') slug: string) {
    return this.videosService.findVideoBySlug(slug, false);
  }

  // ─── Public :slug (after admin and series) ────────────

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    await this.videosService.incrementViewCount(slug);
    return this.videosService.findVideoBySlug(slug);
  }

  // ─── Protected video endpoints ────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateVideoDto) {
    return this.videosService.createVideo(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.videosService.updateVideo(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.deleteVideo(id);
  }

  // ─── Protected series endpoints ───────────────────────

  @Post('series')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createSeries(@Body() dto: CreateVideoSeriesDto) {
    return this.videosService.createSeries(dto);
  }

  @Patch('series/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateSeries(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVideoSeriesDto,
  ) {
    return this.videosService.updateSeries(id, dto);
  }

  @Delete('series/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSeries(@Param('id', ParseUUIDPipe) id: string) {
    return this.videosService.deleteSeries(id);
  }
}
