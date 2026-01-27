import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SearchBar, EmptyState, EventCard, AIFeatureCard } from '@/components/resources';
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

type View = 'main' | 'resources' | 'resource-detail' | 'ai-test-gen' | 'chatbot';

export default function ResourcesPage() {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

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

  // Resource Detail View
  if (currentView === 'resource-detail' && selectedResource) {
    return (
      <ResourceDetailView
        resource={selectedResource}
        onBack={() => {
          setCurrentView('resources');
          setSelectedResource(null);
        }}
        onDownload={() => handleDownload(selectedResource)}
      />
    );
  }

  // Resources List View
  if (currentView === 'resources' && selectedEventName) {
    const selectedEvent = FBLA_EVENTS.find(e => e.name === selectedEventName);

    return (
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
    );
  }

  // AI Test Generator View
  if (currentView === 'ai-test-gen') {
    return <AITestGeneratorView onBack={() => setCurrentView('main')} />;
  }

  // Chatbot View
  if (currentView === 'chatbot') {
    return <ChatbotView onBack={() => setCurrentView('main')} />;
  }

  // Main View
  return (
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
  );
}
