"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="fieldset"
      className={cn("space-y-6", className)}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & {
  variant?: "legend" | "label";
}) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(
        "text-foreground",
        variant === "legend"
          ? "text-base font-semibold mb-2"
          : "text-sm font-medium",
        className
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("space-y-6", className)}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "responsive";
}) {
  return (
    <div
      data-slot="field"
      role="group"
      className={cn(
        "flex",
        orientation === "vertical" && "flex-col gap-2",
        orientation === "horizontal" && "flex-row items-center gap-4",
        orientation === "responsive" && "flex-col gap-2 sm:flex-row sm:items-center sm:gap-4",
        className
      )}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

const FieldLabel = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot> & {
    asChild?: boolean;
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "label";
  return (
    <Comp
      ref={ref}
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative flex items-center py-4", className)}
      {...props}
    >
      <div className="flex-1 border-t border-border" />
      {props.children && (
        <span className="px-2 text-sm text-muted-foreground">
          {props.children}
        </span>
      )}
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function FieldError({
  className,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  if (errors && errors.length > 0) {
    const errorMessages = errors
      .filter((e): e is { message: string } => e !== undefined && e.message !== undefined)
      .map((e) => e.message);

    if (errorMessages.length === 0) return null;

    return (
      <div
        data-slot="field-error"
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {errorMessages.length === 1 ? (
          <p>{errorMessages[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      data-slot="field-error"
      className={cn("text-sm text-destructive", className)}
      {...props}
    />
  );
}

export {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
};
