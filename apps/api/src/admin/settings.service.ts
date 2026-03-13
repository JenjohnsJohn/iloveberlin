import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SiteSetting, SettingGroup, SettingType } from './entities/site-setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepository: Repository<SiteSetting>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<SiteSetting[]> {
    return this.settingsRepository.find({ order: { group: 'ASC', key: 'ASC' } });
  }

  async findByGroup(group: SettingGroup): Promise<SiteSetting[]> {
    return this.settingsRepository.find({
      where: { group },
      order: { key: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<SiteSetting | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }

  async updateByKey(key: string, value: string | null): Promise<SiteSetting> {
    const setting = await this.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    this.validateValue(setting.type, value);
    setting.value = value;
    return this.settingsRepository.save(setting);
  }

  async updateBulk(
    updates: { key: string; value: string | null }[],
  ): Promise<SiteSetting[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results: SiteSetting[] = [];

      for (const update of updates) {
        const setting = await queryRunner.manager.findOne(SiteSetting, {
          where: { key: update.key },
        });
        if (!setting) {
          throw new NotFoundException(`Setting with key "${update.key}" not found`);
        }
        this.validateValue(setting.type, update.value);
        setting.value = update.value;
        results.push(await queryRunner.manager.save(setting));
      }

      await queryRunner.commitTransaction();
      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateValue(type: SettingType, value: string | null): void {
    if (value === null || value === '') return;

    switch (type) {
      case SettingType.NUMBER:
        if (isNaN(Number(value))) {
          throw new BadRequestException(`Value must be a valid number`);
        }
        break;
      case SettingType.BOOLEAN:
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`Value must be "true" or "false"`);
        }
        break;
      case SettingType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`Value must be valid JSON`);
        }
        break;
    }
  }
}
