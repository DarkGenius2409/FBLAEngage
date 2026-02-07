import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import { MobileHeader } from "./MobileHeader";
import { LoadingSpinner } from "./LoadingSpinner";
import { generateMultipleChoiceQuestions } from "@/lib/gemini";
import type { MultipleChoiceQuestion } from "@/lib/gemini";
import { FBLA_EVENTS } from "@/lib/fblaEvents";

const QUESTION_COUNTS = [5, 10, 15, 20] as const;

interface AITestGeneratorViewProps {
  onBack: () => void;
  onTestGenerated: (questions: MultipleChoiceQuestion[], eventName: string) => void;
}

export function AITestGeneratorView({ onBack, onTestGenerated }: AITestGeneratorViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const filteredFBLAEvents =
    eventCategoryFilter === "all"
      ? FBLA_EVENTS
      : FBLA_EVENTS.filter((event) => event.category === eventCategoryFilter);

  const handleGenerateTest = async () => {
    if (!selectedEvent) return;

    setIsGenerating(true);
    setTestError(null);

    try {
      const eventName = selectedEvent;

      const questions = await generateMultipleChoiceQuestions(eventName, questionCount);
      onTestGenerated(questions, eventName);
    } catch (error) {
      console.error("Error generating test questions:", error);
      setTestError(
        error instanceof Error
          ? error.message
          : "Failed to generate test questions. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <MobileHeader title="AI Test Generator" onBack={onBack} />

      {isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <LoadingSpinner
            title="Generating Test Questions"
            subtitle={`AI is creating personalized questions for ${selectedEvent || "your event"}...`}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto momentum-scroll">
          <div className="px-4 py-6">
            {/* Header Card */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">AI-Powered Practice</h2>
                  <p className="text-muted-foreground text-sm">
                    Generate unlimited test questions
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Select an FBLA competitive event to generate personalized practice questions using AI.
              </p>
            </div>

            {/* Event Selection Card */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="text-base font-semibold text-foreground mb-6">
                Select Event
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Filter by Category
                  </label>
                  <select
                    value={eventCategoryFilter}
                    onChange={(e) => {
                      setEventCategoryFilter(e.target.value);
                      setSelectedEvent("");
                    }}
                    className="w-full px-5 py-4 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="all">All Categories</option>
                    <option value="Objective Test">Objective Test</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Role Play">Role Play</option>
                    <option value="Production">Production</option>
                    <option value="Chapter Event">Chapter Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    FBLA Competitive Event
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-5 py-4 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select an FBLA event...</option>
                    {filteredFBLAEvents.map((event) => (
                      <option key={event.name} value={event.name}>
                        {event.name} ({event.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvent && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-base font-semibold text-foreground mb-2">
                      {selectedEvent}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {FBLA_EVENTS.find((e) => e.name === selectedEvent)?.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Grades {FBLA_EVENTS.find((e) => e.name === selectedEvent)?.eligibleGrades}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Number of Questions
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {QUESTION_COUNTS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          questionCount === count
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mb-6"
              onClick={handleGenerateTest}
              disabled={!selectedEvent || isGenerating}
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
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 mb-6">
                {testError}
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </div>
      )}
    </div>
  );
}
