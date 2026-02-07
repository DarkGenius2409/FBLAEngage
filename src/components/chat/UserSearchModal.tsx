import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentSearch } from "@/hooks/useStudentSearch";
import type { Student } from "@/lib/models";
import { Search, Loader2 } from "lucide-react";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeIds: string[];
  submitLabel: string;
  onSubmit: (selected: Student[]) => void;
  title?: string;
}

export function UserSearchModal({
  open,
  onOpenChange,
  excludeIds,
  submitLabel,
  onSubmit,
  title = "Find people",
}: UserSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student[]>([]);

  const { results, loading, error } = useStudentSearch(query, {
    excludeIds,
    limit: 20,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected([]);
    }
  }, [open]);

  const toggle = (s: Student) => {
    setSelected((prev) =>
      prev.some((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : [...prev, s],
    );
  };

  const handleSubmit = () => {
    onSubmit(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!w-[92vw] max-w-2xl my-6 sm:my-8 h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-lg gap-0 overflow-hidden !p-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "92vw",
          maxWidth: "42rem",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          paddingTop: 0,
          paddingBottom: 0,
        }}
        aria-describedby={undefined}
      >
        {/* Drag Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        <DialogHeader className="px-0 pt-6 pb-4 sm:pt-8 sm:pb-6 shrink-0">
          <DialogTitle className="text-lg text-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-0 py-6 space-y-4">
          <div className="relative">
            <Search
              className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none shrink-0"
              style={{ left: "1.5rem" }}
            />
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 sm:h-10 text-base sm:text-sm border-input bg-background pr-4"
              style={{ paddingLeft: "4rem" }}
              autoFocus
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto border border-border rounded-xl divide-y divide-border bg-background">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="p-4 text-sm text-destructive">
                {error.message}
              </div>
            )}
            {!loading && !error && query.trim() && results.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No users found
              </div>
            )}
            {!loading &&
              results.map((s) => {
                const isSelected = selected.some((x) => x.id === s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`w-full flex items-center gap-4 p-4 min-h-14 text-left transition-colors touch-manipulation ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      {s.image ? (
                        <AvatarImage src={s.image} alt={s.name} />
                      ) : null}
                      <AvatarFallback>{getInitials(s.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.email}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex-shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-full h-full text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <DialogFooter className="flex-row gap-3 px-0 py-6 sm:py-8 border-t border-border shrink-0">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm border-border bg-background hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none h-12 sm:h-10 text-base sm:text-sm"
            onClick={handleSubmit}
            disabled={selected.length === 0}
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
