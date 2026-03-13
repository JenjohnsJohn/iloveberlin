import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBookmark } from './entities/user-bookmark.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(UserBookmark)
    private readonly bookmarkRepository: Repository<UserBookmark>,
  ) {}

  async toggle(
    userId: string,
    bookmarkableType: string,
    bookmarkableId: string,
  ): Promise<{ bookmarked: boolean }> {
    const existing = await this.bookmarkRepository.findOne({
      where: {
        user_id: userId,
        bookmarkable_type: bookmarkableType,
        bookmarkable_id: bookmarkableId,
      },
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    }

    const bookmark = this.bookmarkRepository.create({
      user_id: userId,
      bookmarkable_type: bookmarkableType,
      bookmarkable_id: bookmarkableId,
    });

    await this.bookmarkRepository.save(bookmark);
    return { bookmarked: true };
  }

  async findByUser(
    userId: string,
    type?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: UserBookmark[]; total: number; page: number; limit: number }> {
    const where: Record<string, unknown> = { user_id: userId };
    if (type) {
      where.bookmarkable_type = type;
    }

    const [data, total] = await this.bookmarkRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async isBookmarked(
    userId: string,
    bookmarkableType: string,
    bookmarkableId: string,
  ): Promise<{ bookmarked: boolean }> {
    const count = await this.bookmarkRepository.count({
      where: {
        user_id: userId,
        bookmarkable_type: bookmarkableType,
        bookmarkable_id: bookmarkableId,
      },
    });

    return { bookmarked: count > 0 };
  }
}
