import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':type/:id')
  toggle(
    @CurrentUser('id') userId: string,
    @Param('type') type: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookmarksService.toggle(userId, type, id);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookmarksService.findByUser(
      userId,
      type,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('check/:type/:id')
  check(
    @CurrentUser('id') userId: string,
    @Param('type') type: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookmarksService.isBookmarked(userId, type, id);
  }
}
