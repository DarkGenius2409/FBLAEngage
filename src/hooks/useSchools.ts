import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { School } from '@/lib/models';

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setSchools(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch schools'));
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  return { schools, loading, error, refetch: fetchSchools };
}
