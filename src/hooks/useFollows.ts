import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { StudentFollowInsert } from '@/lib/models';

export function useFollows(studentId: string | null) {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchFollows();
    }
  }, [studentId]);

  const fetchFollows = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);

      // Get following (people this user follows)
      const { data: followingData, error: followingError } = await supabase
        .from('student_follows')
        .select('following_id')
        .eq('follower_id', studentId);

      if (followingError) throw followingError;

      // Get followers (people who follow this user)
      const { data: followersData, error: followersError } = await supabase
        .from('student_follows')
        .select('follower_id')
        .eq('following_id', studentId);

      if (followersError) throw followersError;

      setFollowing((followingData || []).map((f) => f.following_id));
      setFollowers((followersData || []).map((f) => f.follower_id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch follows'));
      console.error('Error fetching follows:', err);
    } finally {
      setLoading(false);
    }
  };

  const follow = async (targetUserId: string) => {
    if (!studentId) return { error: new Error('No student ID provided') };

    try {
      const followData: StudentFollowInsert = {
        follower_id: studentId,
        following_id: targetUserId,
      };

      const { error: insertError } = await supabase
        .from('student_follows')
        .insert(followData);

      if (insertError) throw insertError;

      setFollowing((prev) => [...prev, targetUserId]);

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to follow user');
      console.error('Error following user:', err);
      return { error };
    }
  };

  const unfollow = async (targetUserId: string) => {
    if (!studentId) return { error: new Error('No student ID provided') };

    try {
      const { error: deleteError } = await supabase
        .from('student_follows')
        .delete()
        .eq('follower_id', studentId)
        .eq('following_id', targetUserId);

      if (deleteError) throw deleteError;

      setFollowing((prev) => prev.filter((id) => id !== targetUserId));

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unfollow user');
      console.error('Error unfollowing user:', err);
      return { error };
    }
  };

  const isFollowing = (targetUserId: string) => {
    return following.includes(targetUserId);
  };

  return {
    following,
    followers,
    followingCount: following.length,
    followersCount: followers.length,
    loading,
    error,
    isFollowing,
    follow,
    unfollow,
    refetch: fetchFollows,
  };
}
