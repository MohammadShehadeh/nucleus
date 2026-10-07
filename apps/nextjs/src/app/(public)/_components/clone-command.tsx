"use client";

import { Button } from "@nucleus/ui/components/button";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const COPIED_RESET_MS = 2000;

interface CloneCommandProps {
  command: string;
}

export const CloneCommand = ({ command }: CloneCommandProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(command);
    setIsCopied(true);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      aria-label={isCopied ? "Copied clone command" : "Copy clone command"}
      className="gap-3 font-mono text-sm"
    >
      <span className="text-primary shrink-0 select-none">$</span>
      <span className="min-w-0 truncate text-left">{command}</span>
      {isCopied ? (
        <Check className="size-4 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="text-muted-foreground size-4 shrink-0" />
      )}
    </Button>
  );
};
