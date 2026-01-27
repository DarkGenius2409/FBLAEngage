import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Check } from 'lucide-react';
import { TikTokIcon } from '@/components/TikTokIcon';

interface SocialSyncCardProps {
  platform: 'instagram' | 'tiktok';
  isConnected: boolean;
  onToggle: () => void;
}

export function SocialSyncCard({ platform, isConnected, onToggle }: SocialSyncCardProps) {
  const isInstagram = platform === 'instagram';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isInstagram
            ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
            : 'bg-black'
        }`}>
          {isInstagram ? (
            <Instagram className="h-5 w-5 text-white" />
          ) : (
            <TikTokIcon />
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium">{isInstagram ? 'Instagram' : 'TikTok'}</h4>
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <Button
        variant={isConnected ? 'outline' : 'default'}
        size="sm"
        className={isConnected ? '' : 'bg-primary hover:bg-primary/90'}
        onClick={onToggle}
      >
        {isConnected ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            <span className="text-xs">Connected</span>
          </>
        ) : (
          <span className="text-xs">Connect</span>
        )}
      </Button>
    </div>
  );
}
