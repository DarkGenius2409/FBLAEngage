import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/components/ui/utils";
import type { MultipleChoiceQuestion } from "@/lib/gemini";

type QuestionWithId = MultipleChoiceQuestion & { id: number };
type AnswerKey = "A" | "B" | "C" | "D";

interface TestTakeState {
  questions: MultipleChoiceQuestion[];
  eventName: string;
}

export default function TestTakePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TestTakeState | null;

  if (!state?.questions?.length) {
    navigate("/resources", { replace: true });
    return null;
  }

  const questions: QuestionWithId[] = state.questions.map((q, i) => ({
    ...q,
    id: i,
  }));
  const eventName = state.eventName;

  const [answers, setAnswers] = useState<Record<number, AnswerKey>>({});

  const answeredCount = Object.keys(answers).length;
  const percentage = Math.round((answeredCount / questions.length) * 100);

  const handleAnswerChange = (questionId: number, value: AnswerKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    navigate("/resources/ai-test/results", {
      state: { questions, answers, eventName },
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Progress section */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </span>
          <span className="font-semibold text-foreground">{percentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted border border-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-36 momentum-scroll">
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="flex shrink-0 items-center justify-center w-8 h-8 min-w-8 min-h-8 rounded-full overflow-hidden bg-primary text-sm font-semibold text-primary-foreground"
                  style={{ aspectRatio: "1" }}
                >
                  {index + 1}
                </div>
                <p className="flex-1 font-medium leading-relaxed pt-0.5">
                  {q.question}
                </p>
              </div>

              <RadioGroup
                value={answers[q.id] ?? ""}
                onValueChange={(value) =>
                  handleAnswerChange(q.id, value as AnswerKey)
                }
                className="space-y-3"
              >
                {(["A", "B", "C", "D"] as const).map((option) => {
                  const isSelected = answers[q.id] === option;

                  return (
                    <label
                      key={option}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      )}
                    >
                      <RadioGroupItem
                        value={option}
                        className={cn(
                          isSelected &&
                            "bg-primary border-primary [&_[data-slot=radio-group-indicator]]:invisible"
                        )}
                      />
                      <span className="text-sm">
                        {option}. {q.options[option]}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Submit - above bottom nav */}
      <div
        className="fixed left-0 right-0 flex w-full justify-center border-t border-border bg-background py-5 z-50"
        style={{
          bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Button
          className="mx-auto h-12 rounded-xl text-base font-semibold"
          style={{ width: "calc(100vw - 2rem)" }}
          disabled={answeredCount === 0}
          onClick={handleSubmit}
        >
          Submit Test
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
