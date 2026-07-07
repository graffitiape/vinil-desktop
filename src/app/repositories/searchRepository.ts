import { apiClient } from '@/app/services/axios';
import type { SearchResults } from '@/app/types/api';

export const searchRepository = {
  search: (query: string) =>
    apiClient.get<SearchResults>('/search', { params: { q: query } }).then((r) => r.data),
};
