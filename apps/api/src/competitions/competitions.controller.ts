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
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { EnterCompetitionDto } from './dto/enter-competition.dto';
import { CompetitionQueryDto } from './dto/competition-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  // ─── Static / named routes FIRST ───────────────────────────

  @Get()
  findActive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.competitionsService.findActive(page, limit);
  }

  @Get('archive')
  findArchive(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.competitionsService.findArchive(page, limit);
  }

  // ─── User endpoints (before :slug) ─────────────────────────

  @Get('user/my-entries')
  @UseGuards(JwtAuthGuard)
  myEntries(@CurrentUser('id') userId: string) {
    return this.competitionsService.getMyEntries(userId);
  }

  // ─── Admin endpoints (before :slug) ────────────────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll(@Query() query: CompetitionQueryDto) {
    return this.competitionsService.findAll(query);
  }

  @Get('admin/:slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminFindBySlug(@Param('slug') slug: string) {
    return this.competitionsService.findBySlug(slug, false);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateCompetitionDto) {
    return this.competitionsService.create(dto);
  }

  // ─── Parameterized UUID routes (before :slug) ──────────────

  @Post(':id/enter')
  @UseGuards(JwtAuthGuard)
  enter(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: EnterCompetitionDto,
  ) {
    return this.competitionsService.enter(id, userId, dto);
  }

  @Post(':id/select-winner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  selectWinner(@Param('id', ParseUUIDPipe) id: string) {
    return this.competitionsService.selectWinner(id);
  }

  @Get(':id/entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getEntries(@Param('id', ParseUUIDPipe) id: string) {
    return this.competitionsService.getEntries(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompetitionDto,
  ) {
    return this.competitionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.competitionsService.delete(id);
  }

  // ─── Public :slug route LAST ───────────────────────────────

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.competitionsService.findBySlug(slug);
  }
}
