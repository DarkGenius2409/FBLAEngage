import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, MessageCircle, Plus, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCapacitor } from '@/hooks/useCapacitor';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { keyboardVisible } = useCapacitor();

  const currentPath = location.pathname;
  const isHome = currentPath === '/';
  const isCalendar = currentPath === '/calendar';
  const isResources = currentPath === '/resources';
  const isChat = currentPath === '/chat';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate bottom nav height for main content padding
  const bottomNavHeight = keyboardVisible ? '0px' : 'calc(4rem + env(safe-area-inset-bottom, 0px))';

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - stays at top of flex container, with safe area padding */}
      <header 
        className="flex-shrink-0 bg-primary text-primary-foreground border-b z-50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <span className="text-accent-foreground text-sm font-semibold">FB</span>
            </div>
            <span className="font-semibold">FBLA Engage</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - scrollable area */}
      <main 
        className="flex-1 overflow-y-auto overscroll-none relative"
        style={{ paddingBottom: bottomNavHeight }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - stays at bottom of flex container */}
      {!keyboardVisible && (
        <nav 
          className="flex-shrink-0 bg-card border-t z-40"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="container mx-auto px-2">
            <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isHome ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isCalendar ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/calendar')}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Calendar</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                onClick={() => navigate('/?post=true')}
              >
                <div className={`rounded-full p-2 ${isHome ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">Post</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isResources ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/resources')}
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-xs">Resources</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isChat ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">Chat</span>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
