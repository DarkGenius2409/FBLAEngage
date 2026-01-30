import { JitsiMeeting } from '@jitsi/react-sdk';
import { Spinner } from '@/components/ui/spinner';

interface VideoMeetingPageProps {
  chatId: string;
  userName: string;
  userEmail?: string;
  onClose: () => void;
}

export default function VideoMeetingPage({ chatId, userName, userEmail, onClose }: VideoMeetingPageProps) {
  // Generate a unique room name based on the chat ID
  // Prefix ensures we don't collide with other Jitsi rooms
  const roomName = `fbla-engage-${chatId}`;

  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          disableModeratorIndicator: true,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          subject: 'FBLA Engage Video Call',
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'hangup',
            'chat',
            'settings',
            'videoquality',
            'filmstrip',
            'participants-pane',
            'tileview',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
        }}
        userInfo={{
          displayName: userName,
          email: userEmail || '',
        }}
        spinner={() => (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Spinner className="size-8" />
            <p className="text-white text-sm">Connecting to video call...</p>
          </div>
        )}
        onReadyToClose={onClose}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
