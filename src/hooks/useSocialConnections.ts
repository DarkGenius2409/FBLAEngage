/**
 * Hook for managing social media connections (Instagram, TikTok)
 * Handles OAuth flows, connection status, and content sync
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export type SocialPlatform = 'instagram' | 'tiktok';

export interface SocialConnection {
  id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface SyncResult {
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  error?: string;
}

interface UseSocialConnectionsReturn {
  connections: SocialConnection[];
  loading: boolean;
  error: string | null;
  isConnected: (platform: SocialPlatform) => boolean;
  getConnection: (platform: SocialPlatform) => SocialConnection | undefined;
  connect: (platform: SocialPlatform) => Promise<void>;
  disconnect: (platform: SocialPlatform) => Promise<boolean>;
  sync: (platform: SocialPlatform) => Promise<SyncResult>;
  syncing: SocialPlatform | null;
  refetch: () => Promise<void>;
}

// Get Supabase Functions URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

export function useSocialConnections(): UseSocialConnectionsReturn {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<SocialPlatform | null>(null);

  // Store code verifier for TikTok PKCE flow
  const [tiktokCodeVerifier, setTiktokCodeVerifier] = useState<string | null>(null);

  // Fetch user's social connections
  const fetchConnections = useCallback(async () => {
    if (!user?.id) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('social_connections')
        .select('id, platform, platform_user_id, username, display_name, profile_picture, last_synced_at, created_at')
        .eq('student_id', user.id);

      if (fetchError) {
        throw fetchError;
      }

      setConnections(data || []);
    } catch (err) {
      console.error('Error fetching social connections:', err);
      setError('Failed to load social connections');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check if a platform is connected
  const isConnected = useCallback((platform: SocialPlatform): boolean => {
    return connections.some(c => c.platform === platform);
  }, [connections]);

  // Get connection for a platform
  const getConnection = useCallback((platform: SocialPlatform): SocialConnection | undefined => {
    return connections.find(c => c.platform === platform);
  }, [connections]);

  // Initiate OAuth connection
  const connect = useCallback(async (platform: SocialPlatform) => {
    if (!user) {
      setError('You must be logged in to connect social accounts');
      return;
    }

    try {
      setError(null);

      // Get authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call edge function to get OAuth URL
      const response = await fetch(`${FUNCTIONS_URL}/${platform}-auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate connection');
      }

      const { url, codeVerifier } = await response.json();

      // Store code verifier for TikTok
      if (platform === 'tiktok' && codeVerifier) {
        setTiktokCodeVerifier(codeVerifier);
      }

      // Open OAuth URL in in-app browser
      await Browser.open({ url });

    } catch (err) {
      console.error(`Error connecting ${platform}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [user]);

  // Disconnect a platform
  const disconnect = useCallback(async (platform: SocialPlatform): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in');
      return false;
    }

    try {
      setError(null);

      // Get authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call edge function to disconnect
      const response = await fetch(`${FUNCTIONS_URL}/social-disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect');
      }

      // Refresh connections
      await fetchConnections();
      return true;

    } catch (err) {
      console.error(`Error disconnecting ${platform}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
      return false;
    }
  }, [user, fetchConnections]);

  // Sync content from a platform
  const sync = useCallback(async (platform: SocialPlatform): Promise<SyncResult> => {
    if (!user) {
      return { success: false, imported: 0, skipped: 0, total: 0, error: 'Not logged in' };
    }

    try {
      setSyncing(platform);
      setError(null);

      // Get authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call sync edge function
      const response = await fetch(`${FUNCTIONS_URL}/${platform}-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      // Refresh connections to update last_synced_at
      await fetchConnections();

      return {
        success: true,
        imported: data.imported || 0,
        skipped: data.skipped || 0,
        total: data.total || 0,
      };

    } catch (err) {
      console.error(`Error syncing ${platform}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      return { success: false, imported: 0, skipped: 0, total: 0, error: errorMessage };

    } finally {
      setSyncing(null);
    }
  }, [user, fetchConnections]);

  // Listen for deep link callbacks from OAuth
  useEffect(() => {
    const handleAppUrlOpen = async (event: { url: string }) => {
      const url = new URL(event.url);
      
      // Check if this is a social callback
      if (url.pathname.includes('social-callback')) {
        const status = url.searchParams.get('status');
        const message = url.searchParams.get('message');

        // Close the browser
        await Browser.close();

        if (status === 'success') {
          // Refresh connections
          await fetchConnections();
        } else if (status === 'error') {
          setError(message || 'Connection failed');
        }
      }
    };

    // Add listener for app URL opens
    let listenerHandle: { remove: () => void } | null = null;
    
    App.addListener('appUrlOpen', handleAppUrlOpen).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [fetchConnections, tiktokCodeVerifier]);

  // Fetch connections on mount and when user changes
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    loading,
    error,
    isConnected,
    getConnection,
    connect,
    disconnect,
    sync,
    syncing,
    refetch: fetchConnections,
  };
}
