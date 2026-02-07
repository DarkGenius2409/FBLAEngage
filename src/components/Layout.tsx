import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Calendar, BookOpen, MessageCircle, Plus, User, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useStudentSearch } from '@/hooks/useStudentSearch';
import { AnimatePresence, motion } from 'framer-motion';
import type { Student } from '@/lib/models';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function HeaderSearchResults({
  query,
  results,
  loading,
  onSelect,
}: {
  query: string;
  results: Student[];
  loading: boolean;
  onSelect: (student: Student) => void;
}) {
  if (!query.trim()) {
    return (
      <div className="py-6 px-4 text-center text-sm text-muted-foreground">
        Type to search for people
      </div>
    );
  }
  if (loading) {
    return (
      <div className="py-6 px-4 text-center text-sm text-muted-foreground">
        Searching...
      </div>
    );
  }
  if (results.length === 0) {
    return (
      <div className="py-6 px-4 text-center text-sm text-muted-foreground">
        No users found
      </div>
    );
  }
  return (
    <ul className="py-1">
      {results.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onSelect(s)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/60 active:bg-muted transition-colors touch-manipulation"
          >
            <Avatar className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground text-xs">
              {s.image ? (
                <AvatarImage src={s.image} alt={s.name} />
              ) : null}
              <AvatarFallback>{getInitials(s.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground truncate">{s.email}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { keyboardVisible } = useCapacitor();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { results: searchResults, loading: searchLoading } = useStudentSearch(searchQuery, {
    excludeIds: user?.id ? [user.id] : [],
    limit: 15,
  });

  useEffect(() => {
    if (searchOpen) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [searchOpen]);

  const currentPath = location.pathname;
  const isHome = currentPath === '/';
  const isCalendar = currentPath === '/calendar';
  const isResources = currentPath === '/resources' || currentPath.startsWith('/resources/');
  const isChat = currentPath === '/chat';
  const showBackInHeader =
    currentPath === '/profile/edit' ||
    currentPath === '/profile/accessibility' ||
    currentPath === '/resources/ai-test/take' ||
    currentPath === '/resources/ai-test/results';

  const getBackDestination = () => {
    if (currentPath.startsWith('/resources/')) return '/resources';
    if (currentPath === '/profile/edit' || currentPath === '/profile/accessibility')
      return '/profile';
    return '/';
  };

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
      {/* App Header - blue bar from top (under dynamic island) through header */}
      <header
        className="flex-shrink-0 bg-primary text-primary-foreground border-b z-50"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="relative flex h-10 w-full items-center justify-between gap-2 px-4">
          <div className="flex shrink-0 items-center gap-2">
            {showBackInHeader && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-primary-foreground hover:bg-white/10 -ml-2"
                onClick={() => navigate(getBackDestination())}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex shrink-0 cursor-pointer items-center gap-2 touch-manipulation bg-transparent border-0 p-0 text-left"
            >
              <img
                src="/brand-icon.png"
                alt=""
                className="h-8 w-8 shrink-0 object-contain"
                width={32}
                height={32}
              />
              <span className="font-semibold text-primary-foreground">FBLA Engage</span>
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-white/10"
                  aria-label="Search people"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(calc(100vw-2rem),320px)] p-0"
                align="end"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                    />
                  </div>
                </div>
                <div className="max-h-[min(60vh,320px)] overflow-y-auto">
                  <HeaderSearchResults
                    query={searchQuery}
                    results={searchResults}
                    loading={searchLoading}
                    onSelect={(student: Student) => {
                      setSearchOpen(false);
                      navigate(`/profile/${student.id}`);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
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
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
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
                <div className="rounded-full p-2 bg-primary text-primary-foreground">
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
