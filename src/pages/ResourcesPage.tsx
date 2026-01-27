import { useState } from 'react';
import { SearchBar, EventCard, AIFeatureCard, EmptyState } from '@/components/resources';
import { Sparkles, MessageSquare, FileText } from 'lucide-react';
import { useResources } from '@/hooks';
import type { ResourceWithCategory } from '@/lib/models';
import { FBLA_EVENTS } from '@/lib/fblaEvents';
import {
  ResourceDetailView,
  ResourcesListView,
  AITestGeneratorView,
  ChatbotView,
} from '@/components/resources';
import { AnimatePresence, motion } from 'framer-motion';

type View = 'main' | 'resources' | 'resource-detail' | 'ai-test-gen' | 'chatbot';

// Slide animation variants
const slideVariants = {
  enter: { x: '100%', opacity: 1 },
  center: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 1 },
};

const slideTransition = {
  type: 'tween' as const,
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

export default function ResourcesPage() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter] = useState<string>('all');

  // Fetch resources for selected event (or all if on main view)
  const eventNameForResources = currentView === 'main' ? null : selectedEventName;
  const { resources, loading: resourcesLoading, incrementDownloads } = useResources(
    eventNameForResources,
    null
  );

  // Use resources as allResources when on main view
  const allResources = currentView === 'main' ? resources : [];

  // Filter FBLA events
  const filteredEvents = FBLA_EVENTS.filter(event => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    if (searchQuery) {
      return event.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Get resource count for each event
  const getEventResourceCount = (eventName: string) => {
    if (currentView === 'main' && allResources) {
      return allResources.filter(r => r.event_name === eventName).length;
    }
    return 0;
  };

  const handleDownload = async (resource: ResourceWithCategory) => {
    await incrementDownloads(resource.id);
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const selectedEvent = selectedEventName ? FBLA_EVENTS.find(e => e.name === selectedEventName) : undefined;

  // Main View with overlay views
  return (
    <>
      {/* Main content */}
      <div className="min-h-screen bg-background pb-20">
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Resources</h1>

          {/* AI Features Section */}
          <div className="space-y-4 mb-8">
            <AIFeatureCard
              title="AI Test Generator"
              description="Create custom practice tests for any FBLA competitive event"
              icon={<Sparkles className="h-6 w-6" />}
              badges={['AI Powered', 'Generate unlimited tests']}
              onClick={() => setCurrentView('ai-test-gen')}
              iconBgColor="primary"
            />

            <AIFeatureCard
              title="FBLA AI Chatbot"
              description="Get instant answers to FBLA questions and study help"
              icon={<MessageSquare className="h-6 w-6" />}
              badges={['24/7 Available', 'Expert knowledge']}
              onClick={() => setCurrentView('chatbot')}
              iconBgColor="accent"
            />
          </div>

          {/* Study Resources by Event Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-4">Study Resources by Event</h2>

            <div className="mb-4">
              <SearchBar
                placeholder="Search events..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {filteredEvents.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12 mb-3 text-muted-foreground" />}
                title="No events found"
                description="Try adjusting your search"
              />
            ) : (
              <div className="space-y-3">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.name}
                    event={event}
                    resourceCount={getEventResourceCount(event.name)}
                    onClick={() => {
                      setSelectedEventName(event.name);
                      setCurrentView('resources');
                      setSearchQuery('');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated overlay views */}
      <AnimatePresence>
        {currentView === 'resources' && selectedEventName && (
          <motion.div
            key="resources-list"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <ResourcesListView
              eventName={selectedEventName}
              event={selectedEvent}
              resources={resources}
              loading={resourcesLoading}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onBack={() => {
                setCurrentView('main');
                setSelectedEventName(null);
                setSearchQuery('');
              }}
              onResourceClick={(resource) => {
                setSelectedResource(resource);
                setCurrentView('resource-detail');
              }}
            />
          </motion.div>
        )}

        {currentView === 'resource-detail' && selectedResource && (
          <motion.div
            key="resource-detail"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <ResourceDetailView
              resource={selectedResource}
              onBack={() => {
                setCurrentView('resources');
                setSelectedResource(null);
              }}
              onDownload={() => handleDownload(selectedResource)}
            />
          </motion.div>
        )}

        {currentView === 'ai-test-gen' && (
          <motion.div
            key="ai-test-gen"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <AITestGeneratorView onBack={() => setCurrentView('main')} />
          </motion.div>
        )}

        {currentView === 'chatbot' && (
          <motion.div
            key="chatbot"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="fixed inset-0 z-50"
          >
            <ChatbotView onBack={() => setCurrentView('main')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
