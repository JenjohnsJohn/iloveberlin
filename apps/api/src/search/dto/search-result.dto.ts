export interface SearchHit {
  id: string;
  type: string;
  title: string;
  description: string;
  slug: string;
  category?: string;
  district?: string;
  status?: string;
  created_at?: string;
  views?: number;
  [key: string]: unknown;
}

export interface SearchResultDto {
  hits: SearchHit[];
  total: number;
  page: number;
  limit: number;
  type?: string;
  query: string;
  processingTimeMs: number;
}

export interface SuggestResultDto {
  suggestions: {
    title: string;
    type: string;
    slug: string;
  }[];
  query: string;
}
