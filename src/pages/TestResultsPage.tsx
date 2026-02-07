import { useNavigate, useLocation } from "react-router-dom";
import { Award, Download, RotateCcw, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MultipleChoiceQuestion } from "@/lib/gemini";

type AnswerKey = "A" | "B" | "C" | "D";
type QuestionWithId = MultipleChoiceQuestion & { id: number };

interface TestResultsState {
  questions: QuestionWithId[];
  answers: Record<number, AnswerKey>;
  eventName: string;
}

export default function TestResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TestResultsState | null;

  if (!state?.questions?.length) {
    navigate("/resources", { replace: true });
    return null;
  }

  const { questions, answers, eventName } = state;

  const calculateResults = () => {
    let correct = 0;
    const wrongQuestions: QuestionWithId[] = [];
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      } else {
        wrongQuestions.push(q);
      }
    });
    return {
      correctCount: correct,
      score: Math.round((correct / questions.length) * 100),
      wrongQuestions,
    };
  };

  const results = calculateResults();

  const handleExport = () => {
    let content = `${eventName} – Practice Test Results\n`;
    content += `${"=".repeat(50)}\n\n`;
    content += `Score: ${results.score}% (${results.correctCount} of ${questions.length} correct)\n\n`;
    content += `${"=".repeat(50)}\n`;
    content += `QUESTIONS AND ANSWERS\n`;
    content += `${"=".repeat(50)}\n\n`;

    questions.forEach((q, index) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      content += `Question ${index + 1}: ${q.question}\n`;
      content += `A. ${q.options.A}\n`;
      content += `B. ${q.options.B}\n`;
      content += `C. ${q.options.C}\n`;
      content += `D. ${q.options.D}\n`;
      content += `\nCorrect Answer: ${q.correctAnswer}. ${
        q.options[q.correctAnswer]
      }\n`;
      content += `Your Answer: ${
        userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : "Not answered"
      }\n`;
      content += `Result: ${isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}\n`;
      content += `\n${"-".repeat(40)}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, "_")}_Test_Results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Scrollable Content - no header, Layout provides brand header with back */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 momentum-scroll">
        {/* Score Card - medal in a circle */}
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full border-2 border-border bg-transparent">
            <Award className="size-10 text-foreground" />
          </div>
          <div className="text-4xl font-bold text-foreground">
            {results.score}%
          </div>
          <div className="mt-1 text-muted-foreground">
            {results.correctCount} of {questions.length} correct
          </div>
        </div>

        {/* Questions to Review */}
        {results.wrongQuestions.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 font-semibold text-foreground">
              Questions to Review ({results.wrongQuestions.length})
            </h2>
            <div className="space-y-4">
              {results.wrongQuestions.map((q) => {
                const questionIndex = questions.findIndex(
                  (question) => question.id === q.id,
                );
                const userAnswer = answers[q.id];

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-transparent p-2 text-base font-bold text-destructive">
                        {questionIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground leading-relaxed">
                          {q.question}
                        </p>
                        <div className="mt-3 space-y-2">
                          {userAnswer != null && (
                            <div className="flex items-start gap-2 text-sm text-destructive">
                              <X className="size-4 shrink-0 mt-0.5" />
                              <span>
                                Your answer: {userAnswer}.{" "}
                                {q.options[userAnswer]}
                              </span>
                            </div>
                          )}
                          <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-500">
                            <Check className="size-4 shrink-0 mt-0.5" />
                            <span>
                              Correct: {q.correctAnswer}.{" "}
                              {q.options[q.correctAnswer]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border bg-card"
            style={{ width: "calc(100vw - 2rem)", maxWidth: "100%" }}
            onClick={handleExport}
          >
            <Download className="size-4" />
            Export Test & Results
          </Button>
          <Button
            className="h-12 rounded-xl text-base font-semibold"
            style={{ width: "calc(100vw - 2rem)", maxWidth: "100%" }}
            onClick={() =>
              navigate("/resources", { state: { openAITestGen: true } })
            }
          >
            <RotateCcw className="size-4" />
            Generate New Test
          </Button>
        </div>
      </div>
    </div>
  );
}
