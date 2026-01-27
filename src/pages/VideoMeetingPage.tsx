import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  Settings,
  Users,
} from 'lucide-react';

interface VideoMeetingPageProps {
  onClose: () => void;
}

export default function VideoMeetingPage({ onClose }: VideoMeetingPageProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mock video feed - in real app, would use WebRTC
    if (videoRef.current && isVideoOn) {
      // Would start video stream here
    }
  }, [isVideoOn]);

  const participants = [
    { id: '1', name: 'You', avatar: 'YO', isMuted: isMuted },
    { id: '2', name: 'Sarah Johnson', avatar: 'SJ', isMuted: false },
    { id: '3', name: 'Marcus Chen', avatar: 'MC', isMuted: true },
  ];

  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Video */}
        <Card className="relative bg-slate-800 overflow-hidden col-span-full">
          {isScreenSharing ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <div className="text-center">
                <Monitor className="h-16 w-16 text-accent mx-auto mb-4" />
                <p className="text-white">Screen Share Active</p>
                <p className="text-sm text-slate-400 mt-2">
                  Presenting: Practice Presentation Slides
                </p>
              </div>
            </div>
          ) : isVideoOn ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-800">
              <div className="text-center">
                <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl text-primary-foreground">YO</span>
                </div>
                <p className="text-white">Your Video</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <div className="text-center">
                <VideoOff className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-white">Camera Off</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
            You {isMuted && '(muted)'}
          </div>
        </Card>

        {/* Participant Videos */}
        {participants.slice(1).map((participant) => (
          <Card key={participant.id} className="relative bg-slate-800 overflow-hidden aspect-video">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-900">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl text-white">{participant.avatar}</span>
                </div>
                <p className="text-white text-sm">{participant.name}</p>
              </div>
            </div>
            {participant.isMuted && (
              <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full">
                <MicOff className="h-3 w-3" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="icon"
              className="rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant={isVideoOn ? 'secondary' : 'destructive'}
              size="icon"
              className="rounded-full"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button
              variant={isScreenSharing ? 'default' : 'secondary'}
              size="icon"
              className="rounded-full"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </Button>
          </div>

          <Button
            variant="destructive"
            className="rounded-full px-6"
            onClick={onClose}
          >
            <Phone className="h-5 w-5 mr-2 rotate-[135deg]" />
            End Call
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg p-4 overflow-y-auto">
          <h3 className="font-medium mb-4">Participants ({participants.length})</h3>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                  {participant.avatar}
                </div>
                <span className="flex-1 text-sm">{participant.name}</span>
                {participant.isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
