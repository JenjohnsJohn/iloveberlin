import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller()
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  // ─── Public endpoint ─────────────────────────────────────

  @Get('homepage')
  getHomepage() {
    return this.homepageService.getHomepageData();
  }

  // ─── Admin endpoints ─────────────────────────────────────

  @Patch('admin/homepage/sections/:section')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateSection(
    @Param('section') section: string,
    @Body('items') items: Array<{ content_type: string; content_id: string; sort_order: number }>,
  ) {
    return this.homepageService.updateSectionItems(section, items);
  }

  @Delete('admin/homepage/items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.homepageService.removeFeaturedItem(id);
  }
}
