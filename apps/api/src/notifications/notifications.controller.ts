import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications/preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@CurrentUser('id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put('notifications/preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, dto);
  }

  @Post('notifications/newsletter/subscribe')
  subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.notificationsService.subscribeNewsletter(dto.email);
  }

  @Get('notifications/newsletter/confirm/:token')
  confirmNewsletter(@Param('token') token: string) {
    return this.notificationsService.confirmNewsletter(token);
  }

  @Get('notifications/newsletter/unsubscribe/:email')
  unsubscribe(@Param('email') email: string) {
    return this.notificationsService.unsubscribe(email);
  }
}
