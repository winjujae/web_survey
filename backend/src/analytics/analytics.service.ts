import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SearchLog, SearchType } from './entities/search-log.entity';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SearchLog)
    private searchLogRepository: Repository<SearchLog>,
  ) {}

  // IP 해시화 함수
  private hashIP(ip: string): string {
    const salt = process.env.IP_SALT || 'search-log-salt';
    return crypto.createHash('sha256')
      .update(ip + salt)
      .digest('hex')
      .substring(0, 16);
  }

  // 검색어 로깅 (비동기)
  async logSearch(
    searchTerm: string,
    searchType: SearchType,
    userId?: string,
    resultCount: number = 0,
    ip?: string,
  ): Promise<void> {
    try {
      // 오늘 날짜 범위 계산
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 오늘 같은 검색어가 있는지 확인
      const existingLog = await this.searchLogRepository.findOne({
        where: {
          search_term: searchTerm,
          user_id: userId || undefined,
          search_type: searchType,
          searched_at: Between(today, tomorrow) as any,
        },
      });

      if (existingLog) {
        // 기존 로그 업데이트 (카운트 증가)
        await this.searchLogRepository.update(existingLog.search_log_id, {
          search_count: existingLog.search_count + 1,
          result_count: Math.max(existingLog.result_count, resultCount),
          last_searched_at: new Date(),
        });
      } else {
        // 새 로그 생성
        await this.searchLogRepository.save({
          search_term: searchTerm,
          user_id: userId,
          search_type: searchType,
          result_count: resultCount,
          ip_hash: ip ? this.hashIP(ip) : undefined,
          search_count: 1,
          searched_at: new Date(),
          last_searched_at: new Date(),
        });
      }
    } catch (error) {
      // 로깅 실패해도 검색 기능은 정상 작동
      console.error('Search logging failed:', error.message);
    }
  }

  // 인기 검색어 조회 (확장용)
  async getPopularSearches(limit: number = 10, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.searchLogRepository
      .createQueryBuilder('log')
      .select(['log.search_term', 'SUM(log.search_count) as total_count', 'COUNT(*) as unique_searches'])
      .where('log.searched_at >= :startDate', { startDate })
      .groupBy('log.search_term')
      .orderBy('total_count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // 검색 통계 조회 (확장용)
  async getSearchStats(days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalSearches = await this.searchLogRepository
      .createQueryBuilder('log')
      .where('log.searched_at >= :startDate', { startDate })
      .select('SUM(log.search_count)', 'total')
      .getRawOne();

    const uniqueTerms = await this.searchLogRepository
      .createQueryBuilder('log')
      .where('log.searched_at >= :startDate', { startDate })
      .select('COUNT(DISTINCT log.search_term)', 'count')
      .getRawOne();

    return {
      total_searches: parseInt(totalSearches?.total || '0'),
      unique_search_terms: parseInt(uniqueTerms?.count || '0'),
      period_days: days,
    };
  }
}
