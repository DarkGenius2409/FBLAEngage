import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Loader2 } from "lucide-react";
import { MobileHeader } from "./MobileHeader";
import { LoadingSpinner } from "./LoadingSpinner";
import { generateTestQuestions } from "@/lib/gemini";
import { FBLA_EVENTS } from "@/lib/fblaEvents";

interface AITestGeneratorViewProps {
  onBack: () => void;
}

export function AITestGeneratorView({ onBack }: AITestGeneratorViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
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
    setGeneratedQuestions([]);

    try {
      const event = FBLA_EVENTS.find((e) => e.name === selectedEvent);
      const eventName = event?.name || "";

      const questions = await generateTestQuestions(eventName || "FBLA", eventName);
      setGeneratedQuestions(questions);
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

  const handleExport = () => {
    const text = generatedQuestions.join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const eventName = selectedEvent || "FBLA";
    a.download = `FBLA_Test_${eventName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 bg-background flex flex-col">
      <MobileHeader title="AI Test Generator" onBack={onBack} />

      <div className="flex-1 overflow-y-auto momentum-scroll">
        {isGenerating ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner
              title="Generating Test Questions"
              subtitle={`AI is creating personalized questions for ${selectedEvent || "your event"}...`}
            />
          </div>
        ) : (
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

            {/* Generated Questions */}
            {generatedQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Generated Questions
                  </h3>
                  <Badge className="bg-primary/10 text-primary">
                    {generatedQuestions.length} questions
                  </Badge>
                </div>

                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="bg-card border border-border p-5 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed flex-1">
                          {question}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base rounded-xl mt-4"
                  onClick={handleExport}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export Questions
                </Button>
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
