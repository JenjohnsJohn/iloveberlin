import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto, SuggestQueryDto, SearchContentType } from './dto/search-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q, {
      type: query.type,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('suggest')
  suggest(@Query() query: SuggestQueryDto) {
    return this.searchService.suggest(query.q);
  }

  @Post('reindex/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async reindexType(@Param('type') type: string) {
    const validTypes = Object.values(SearchContentType) as string[];
    if (!validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid index type "${type}". Valid types: ${validTypes.join(', ')}`,
      );
    }
    await this.searchService.rebuildIndex(type);
    return { message: `Reindex started for ${type}` };
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async reindexAll() {
    await this.searchService.rebuildAllIndexes();
    return { message: 'Reindex started for all content types' };
  }
}
