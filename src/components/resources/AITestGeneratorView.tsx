import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { LoadingSpinner } from './LoadingSpinner';
import { generateTestQuestions } from '@/lib/gemini';
import { FBLA_EVENTS } from '@/lib/fblaEvents';

interface AITestGeneratorViewProps {
  onBack: () => void;
}

export function AITestGeneratorView({ onBack }: AITestGeneratorViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');
  const [testTopic, setTestTopic] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const filteredFBLAEvents = eventCategoryFilter === 'all'
    ? FBLA_EVENTS
    : FBLA_EVENTS.filter(event => event.category === eventCategoryFilter);

  const handleGenerateTest = async () => {
    if (!selectedEvent && !testTopic.trim()) return;

    setIsGenerating(true);
    setTestError(null);
    setGeneratedQuestions([]);

    try {
      const event = selectedEvent
        ? FBLA_EVENTS.find(e => e.name === selectedEvent)
        : null;
      const eventName = event?.name || '';
      const topic = testTopic.trim() || eventName;

      const questions = await generateTestQuestions(eventName || 'FBLA', topic);
      setGeneratedQuestions(questions);
    } catch (error) {
      console.error('Error generating test questions:', error);
      setTestError(
        error instanceof Error
          ? error.message
          : 'Failed to generate test questions. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const text = generatedQuestions.join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const eventName = selectedEvent || testTopic || 'FBLA';
    a.download = `FBLA_Test_${eventName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <MobileHeader title="AI Test Generator" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isGenerating ? (
          <LoadingSpinner
            title="Generating Test Questions"
            subtitle={`AI is creating personalized questions for ${selectedEvent || testTopic || 'your topic'}...`}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-muted-foreground text-sm">
                Generate practice test questions for any FBLA event using AI.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-base">FBLA Competitive Event</label>

                <div className="mb-3">
                  <label className="block text-xs text-muted-foreground mb-2">Filter by Category</label>
                  <select
                    value={eventCategoryFilter}
                    onChange={(e) => {
                      setEventCategoryFilter(e.target.value);
                      setSelectedEvent('');
                    }}
                    className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background"
                  >
                    <option value="all">All Categories</option>
                    <option value="Objective Test">Objective Test</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Role Play">Role Play</option>
                    <option value="Production">Production</option>
                    <option value="Chapter Event">Chapter Event</option>
                  </select>
                </div>

                <select
                  value={selectedEvent}
                  onChange={(e) => {
                    setSelectedEvent(e.target.value);
                    if (e.target.value) {
                      setTestTopic(e.target.value);
                    } else {
                      setTestTopic('');
                    }
                  }}
                  className="w-full px-4 py-3 text-base border border-border rounded-xl bg-background"
                >
                  <option value="">Select an FBLA event...</option>
                  {filteredFBLAEvents.map(event => (
                    <option key={event.name} value={event.name}>
                      {event.name} ({event.category})
                    </option>
                  ))}
                </select>

                {selectedEvent && (
                  <div className="mt-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <p className="text-sm font-semibold text-primary mb-1">
                      {selectedEvent}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {FBLA_EVENTS.find(e => e.name === selectedEvent)?.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Grades {FBLA_EVENTS.find(e => e.name === selectedEvent)?.eligibleGrades}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-semibold text-base">
                  Custom Topic <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                </label>
                <Input
                  placeholder="e.g., Financial Analysis, Digital Marketing"
                  value={testTopic}
                  onChange={(e) => {
                    setTestTopic(e.target.value);
                    if (e.target.value) {
                      setSelectedEvent('');
                    }
                  }}
                  disabled={!!selectedEvent}
                  className="h-12 text-base"
                />
              </div>

              <Button
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                onClick={handleGenerateTest}
                disabled={(!selectedEvent && !testTopic.trim()) || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Test Questions
                  </>
                )}
              </Button>

              {testError && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">
                  {testError}
                </div>
              )}

              {generatedQuestions.length > 0 && (
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-semibold mb-4 text-base">Generated Questions:</h3>
                  <div className="space-y-3">
                    {generatedQuestions.map((question, index) => (
                      <div key={index} className="bg-muted p-4 rounded-xl">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{question}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-12 mt-4 text-base"
                    onClick={handleExport}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Questions
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
