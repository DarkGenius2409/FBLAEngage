"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const isChecked = checked === true;
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={checked}
      style={{
        width: 44,
        height: 24,
        flexShrink: 0,
        backgroundColor: isChecked ? "var(--primary)" : "var(--input)",
      }}
      className={cn(
        "peer inline-flex cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        style={{
          width: 20,
          height: 20,
          backgroundColor: "var(--background)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
        className={cn(
          "pointer-events-none block rounded-full ring-0 transition-transform",
          "data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
