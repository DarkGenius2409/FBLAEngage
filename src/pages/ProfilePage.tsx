import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Award,
  Settings,
  Instagram,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { TikTokIcon } from '@/components/TikTokIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent, useFollows, usePosts } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { student, loading: studentLoading, updateStudent } = useStudent(user?.id || null);
  const { following, followers, followingCount, followersCount, isFollowing, follow, unfollow } = useFollows(user?.id || null);
  const { posts } = usePosts(student?.school_id || null);
  const [isInstagramSynced, setIsInstagramSynced] = useState(false);
  const [isTikTokSynced, setIsTikTokSynced] = useState(false);
  const [postCount, setPostCount] = useState(0);

  React.useEffect(() => {
    if (user?.id) {
      // Get post count
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', user.id)
        .then(({ count }) => {
          setPostCount(count || 0);
        });
    }
  }, [user?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSocialSync = async (platform: 'instagram' | 'tiktok', value: boolean) => {
    // TODO: Implement social media sync when API integration is ready
    if (platform === 'instagram') {
      setIsInstagramSynced(value);
    } else {
      setIsTikTokSynced(value);
    }
    // Note: Social media sync fields are not yet in the database schema
  };

  if (studentLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-20 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-20">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </Card>
      </div>
    );
  }

  const role = student.school_roles?.[0]?.role || 'Member';
  const schoolName = student.school?.name || 'No Chapter';

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl pb-20">
      {/* Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center text-xl rounded-full">
              {getInitials(student.name)}
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold mb-1">{student.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <Briefcase className="h-3 w-3" />
                {role} • {schoolName}
              </p>
              {student.school && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {student.school.city || ''} {student.school.state || ''}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {student.bio || 'No bio yet. Add one to tell others about yourself!'}
          </p>
          {student.interests && student.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {student.interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold mb-1">{postCount}</div>
          <div className="text-xs text-muted-foreground">Posts</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold mb-1">{followersCount}</div>
          <div className="text-xs text-muted-foreground">Followers</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-semibold mb-1">{followingCount}</div>
          <div className="text-xs text-muted-foreground">Following</div>
        </Card>
      </div>

      {/* Social Media Sync */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Connected Accounts</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sync your social media accounts to automatically share your posts to FBLA Engage
        </p>
        
        <div className="space-y-3">
          {/* Instagram */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Instagram</h4>
                <p className="text-xs text-muted-foreground">
                  {isInstagramSynced ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={isInstagramSynced ? 'outline' : 'default'}
              size="sm"
              className={isInstagramSynced ? '' : 'bg-primary hover:bg-primary/90'}
              onClick={() => handleSocialSync('instagram', !isInstagramSynced)}
            >
              {isInstagramSynced ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  <span className="text-xs">Connected</span>
                </>
              ) : (
                <span className="text-xs">Connect</span>
              )}
            </Button>
          </div>

          {/* TikTok */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <TikTokIcon />
              </div>
              <div>
                <h4 className="text-sm font-medium">TikTok</h4>
                <p className="text-xs text-muted-foreground">
                  {isTikTokSynced ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={isTikTokSynced ? 'outline' : 'default'}
              size="sm"
              className={isTikTokSynced ? '' : 'bg-primary hover:bg-primary/90'}
              onClick={() => handleSocialSync('tiktok', !isTikTokSynced)}
            >
              {isTikTokSynced ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  <span className="text-xs">Connected</span>
                </>
              ) : (
                <span className="text-xs">Connect</span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* FBLA Chapter */}
      {student.school && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">My FBLA Chapter</h3>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-xl">🏫</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">{student.school.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {student.school.city || ''} {student.school.state || ''}
                {student.school.zip ? ` • ${student.school.zip}` : ''}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {student.school.member_count || 0} members
                </span>
                {student.school.established_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Est. {new Date(student.school.established_at).getFullYear()}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="text-xs">View</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Achievements */}
      {student.awards && student.awards.length > 0 && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Achievements
          </h3>
          <div className="space-y-2">
            {student.awards.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h4 className="text-sm font-medium">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.event}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Following List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Following ({followingCount})</h3>
          <Button variant="outline" size="sm">
            <span className="text-xs">View All</span>
          </Button>
        </div>
        {following.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not following anyone yet</p>
        ) : (
          <div className="space-y-2">
            {following.slice(0, 5).map((followingId) => (
              <FollowingItem key={followingId} studentId={followingId} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
function FollowingItem({ studentId }: { studentId: string }) {
  const { student } = useStudent(studentId);
  const navigate = useNavigate();

  if (!student) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors">
      <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-sm">
        {getInitials(student.name)}
      </Avatar>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{student.name}</h4>
        <p className="text-xs text-muted-foreground">
          {student.school_roles?.[0]?.role || 'Member'} • {student.school?.name || 'No Chapter'}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate(`/profile/${studentId}`)}
      >
        <span className="text-xs">View</span>
      </Button>
    </div>
  );
}

