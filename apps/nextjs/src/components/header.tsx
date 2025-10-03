"use client";

import { cn } from "@lms/ui/lib/utils";
import { Logo } from "./logo";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-center px-4">
        <Logo />
      </div>
    </header>
  );
}
