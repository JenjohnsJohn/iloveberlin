import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SettingGroup } from './entities/site-setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UpdateSettingsBulkDto } from './dto/update-settings-bulk.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findAll() {
    return this.settingsService.findAll();
  }

  @Get('group/:group')
  async findByGroup(@Param('group') group: SettingGroup) {
    return this.settingsService.findByGroup(group);
  }

  @Patch(':key')
  async updateByKey(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.settingsService.updateByKey(key, dto.value);
  }

  @Patch()
  async updateBulk(@Body() dto: UpdateSettingsBulkDto) {
    return this.settingsService.updateBulk(dto.settings);
  }
}
