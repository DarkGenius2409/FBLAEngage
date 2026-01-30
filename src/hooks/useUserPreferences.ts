import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserPreferences, UserPreferencesUpdate } from '@/lib/models';

export function useUserPreferences(studentId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const FONT_SIZE_PX: Record<string, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px',
  };

  useEffect(() => {
    if (!studentId) {
      setPreferences(null);
      setLoading(false);
      const root = document.documentElement;
      root.classList.remove('dark', 'high-contrast');
      root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large');
      root.style.fontSize = '';
      root.style.setProperty('--font-size', '');
      return;
    }
    fetchPreferences();
  }, [studentId]);

  const fetchPreferences = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      // Try to fetch existing preferences
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" - we'll create defaults
        throw fetchError;
      }

      if (data) {
        setPreferences(data);
        applyPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs: UserPreferences = {
          id: '',
          student_id: studentId,
          theme: 'light',
          font_size: 'medium',
          high_contrast: false,
          reduced_motion: false,
          screen_reader_optimized: false,
          keyboard_navigation_enhanced: false,
          color_blind_mode: 'none',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            student_id: studentId,
            theme: 'light',
            font_size: 'medium',
            high_contrast: false,
            reduced_motion: false,
            screen_reader_optimized: false,
            keyboard_navigation_enhanced: false,
            color_blind_mode: 'none',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (insertedData) {
          setPreferences(insertedData);
          applyPreferences(insertedData);
        }
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement;
    const fontSize = prefs.font_size ?? 'medium';

    // Remove all preference classes
    root.classList.remove(
      'font-size-small',
      'font-size-medium',
      'font-size-large',
      'font-size-extra-large',
      'dark',
      'high-contrast',
      'reduced-motion',
      'screen-reader-optimized',
      'keyboard-navigation-enhanced',
      'color-blind-protanopia',
      'color-blind-deuteranopia',
      'color-blind-tritanopia'
    );

    // Apply theme (default: light; or dark / high-contrast)
    const theme = prefs.theme ?? 'light';
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('dark', 'high-contrast');
    }

    // Apply font size: inline style for immediate, universal effect (rem-based UI scales)
    const px = FONT_SIZE_PX[fontSize] ?? '16px';
    root.style.fontSize = px;
    root.style.setProperty('--font-size', px);
    root.classList.add(`font-size-${fontSize}`);

    // Apply boolean preferences
    if (prefs.reduced_motion) root.classList.add('reduced-motion');
    if (prefs.screen_reader_optimized) root.classList.add('screen-reader-optimized');
    if (prefs.keyboard_navigation_enhanced) root.classList.add('keyboard-navigation-enhanced');

    // Apply color blind mode
    if (prefs.color_blind_mode !== 'none') {
      root.classList.add(`color-blind-${prefs.color_blind_mode}`);
    }
  };

  const updatePreferences = async (updates: UserPreferencesUpdate) => {
    if (!studentId) return { data: null, error: new Error('No student ID provided') };

    try {
      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setPreferences(data);
        applyPreferences(data);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update preferences');
      console.error('Error updating preferences:', err);
      return { data: null, error };
    }
  };

  return { preferences, loading, updatePreferences, refetch: fetchPreferences };
}
