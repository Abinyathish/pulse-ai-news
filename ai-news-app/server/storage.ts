import type { NewsArticle } from "@shared/schema";

export interface IStorage {
  getArticles(): Promise<NewsArticle[]>;
  setArticles(articles: NewsArticle[]): void;
  getLastFetchTime(): number;
  setLastFetchTime(time: number): void;
}

export class MemStorage implements IStorage {
  private articles: NewsArticle[] = [];
  private lastFetchTime: number = 0;

  async getArticles(): Promise<NewsArticle[]> {
    return this.articles;
  }

  setArticles(articles: NewsArticle[]): void {
    this.articles = articles;
  }

  getLastFetchTime(): number {
    return this.lastFetchTime;
  }

  setLastFetchTime(time: number): void {
    this.lastFetchTime = time;
  }
}

export const storage = new MemStorage();
