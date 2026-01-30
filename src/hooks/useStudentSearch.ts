import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Student } from '@/lib/models';

const DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 20;

export interface UseStudentSearchOptions {
  excludeIds?: string[];
  limit?: number;
}

export function useStudentSearch(query: string, options: UseStudentSearchOptions = {}) {
  const { excludeIds = [], limit = DEFAULT_LIMIT } = options;
  const [results, setResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pattern = `%${q}%`;
      let queryBuilder = supabase
        .from('students')
        .select('id, name, email, school_id, bio, image, banner, awards, interests, follower_count, following_count, created_at')
        .or(`name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(limit);

      if (excludeIds.length > 0) {
        const list = excludeIds.map((id) => `"${id}"`).join(',');
        queryBuilder = queryBuilder.not('id', 'in', `(${list})`);
      }

      const { data, error: fetchError } = await queryBuilder;

      if (fetchError) throw fetchError;

      setResults((data as Student[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query.trim(), limit, excludeIds.join(',')]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(runSearch, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query.trim(), runSearch]);

  // Clear results when query is cleared
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
    }
  }, [query]);

  return { results, loading, error };
}
