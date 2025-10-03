import { cn } from "@lms/ui/lib/utils";
import { Logo } from "./logo";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-background border-t", className)}>
      <div className="container flex flex-col items-center justify-center gap-4 py-10">
        <Logo />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mohammad Shehadeh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
