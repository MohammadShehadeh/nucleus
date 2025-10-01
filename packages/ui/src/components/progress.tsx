"use client";

import { cn } from "@lms/ui/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type * as React from "react";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  ref?: React.Ref<React.ComponentRef<typeof ProgressPrimitive.Root>>;
}

const Progress = ({ className, value, ref, ...props }: ProgressProps) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);

export { Progress };
