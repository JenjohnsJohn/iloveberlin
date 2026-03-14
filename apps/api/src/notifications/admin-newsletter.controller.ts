import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminNewsletterQueryDto, SubscriberStatus } from './dto/admin-newsletter-query.dto';

@Controller('admin/newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminNewsletterController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('subscribers')
  getSubscribers(@Query() query: AdminNewsletterQueryDto) {
    return this.notificationsService.getSubscriberList(query);
  }

  @Get('stats')
  getStats() {
    return this.notificationsService.getSubscriberStats();
  }

  @Get('export')
  async exportCsv(
    @Query('status') status: SubscriberStatus | undefined,
    @Res() res: Response,
  ) {
    const subscribers = await this.notificationsService.exportSubscribers(status);
    const header = 'email,status,subscribed_at,unsubscribed_at';
    const rows = subscribers.map(
      (s) =>
        `${s.email},${s.is_confirmed ? 'confirmed' : s.unsubscribed_at ? 'unsubscribed' : 'unconfirmed'},${s.subscribed_at?.toISOString() ?? ''},${s.unsubscribed_at?.toISOString() ?? ''}`,
    );
    const csv = [header, ...rows].join('\n');
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
    });
    res.send(csv);
  }

  @Delete('subscribers/:id')
  removeSubscriber(@Param('id') id: string) {
    return this.notificationsService.removeSubscriber(id);
  }
}
