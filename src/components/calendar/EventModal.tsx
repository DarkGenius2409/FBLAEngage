"use client";

import * as React from "react";
import { Clock, MapPin, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { format, parseISO } from "date-fns";
import type { EventWithRelations } from "@/lib/models";

interface EventModalProps {
  event: EventWithRelations | null;
  open: boolean;
  isRegistered: boolean;
  onClose: () => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  onAddToCalendar?: (event: EventWithRelations) => void;
}

const levelColors: Record<EventWithRelations["level"], string> = {
  regional: "bg-primary text-primary-foreground",
  state: "bg-accent text-accent-foreground",
  national: "bg-destructive text-destructive-foreground",
};

const levelLabels: Record<EventWithRelations["level"], string> = {
  regional: "Regional",
  state: "State",
  national: "National",
};

function formatEventTime(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
  } catch {
    return "All Day";
  }
}

export function EventModal({
  event,
  open,
  isRegistered,
  onClose,
  onRegister,
  onUnregister,
  onAddToCalendar,
}: EventModalProps) {
  if (!open || !event) return null;

  const registrationCount = event.registrations?.length ?? 0;
  const dateFormatted = format(
    parseISO(event.start_date),
    "EEEE, MMMM d, yyyy",
  );
  const timeRange = formatEventTime(event.start_date, event.end_date);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-full sm:max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-lg p-6 gap-0 m-0 sm:m-4 overflow-hidden">
        {/* Drag Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        <DialogHeader className="px-5 pt-4 pb-3 sm:p-6 sm:pb-4 shrink-0">
          <div className="flex items-start gap-3">
            <Badge className={cn("shrink-0", levelColors[event.level])}>
              {levelLabels[event.level]}
            </Badge>
            <DialogTitle className="text-lg text-foreground flex-1">
              {event.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              <span>
                {dateFormatted} &middot; {timeRange}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="size-4 shrink-0" />
              <span>{registrationCount} registered</span>
            </div>
          </div>

          {/* About Section */}
          {event.description && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-2">
                About this event
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="flex-row gap-3 p-5 sm:p-6 pt-4 border-t border-border shrink-0">
          {isRegistered ? (
            <Button
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
              onClick={() => onUnregister?.(event.id)}
            >
              Unregister
            </Button>
          ) : (
            <Button
              className="flex-1 h-12 sm:h-10 text-base sm:text-sm"
              onClick={() => onRegister?.(event.id)}
            >
              Register
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 h-12 sm:h-10 text-base sm:text-sm border-border bg-background hover:bg-muted"
            onClick={() => onAddToCalendar?.(event)}
          >
            Add to Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
