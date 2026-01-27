import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ResourceWithCategory,
  ResourceCategory,
} from '@/lib/models';

export function useResources(eventName?: string | null, categoryId?: string | null) {
  const [resources, setResources] = useState<ResourceWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchResources();
  }, [eventName, categoryId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('resources')
        .select(`
          *,
          category:resource_categories!category_id(*)
        `)
        .order('downloads', { ascending: false });

      if (eventName) {
        query = query.eq('event_name', eventName);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setResources((data as ResourceWithCategory[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch resources'));
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementDownloads = async (resourceId: string) => {
    try {
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('downloads')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('resources')
        .update({ downloads: (resource.downloads || 0) + 1 })
        .eq('id', resourceId);

      if (updateError) throw updateError;

      await fetchResources();

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to increment downloads');
      console.error('Error incrementing downloads:', err);
      return { error };
    }
  };

  return {
    resources,
    loading,
    error,
    incrementDownloads,
    refetch: fetchResources,
  };
}

export function useResourceCategories() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('resource_categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
