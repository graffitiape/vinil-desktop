import { useQuery } from '@tanstack/react-query';
import { searchRepository } from '@/app/repositories/searchRepository';
import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);

  return useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchRepository.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
}
