"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@lms/ui/lib/utils";

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  ref?: React.Ref<React.ComponentRef<typeof SeparatorPrimitive.Root>>;
}

const Separator = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ref,
  ...props
}: SeparatorProps) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className,
    )}
    {...props}
  />
);

export { Separator };
