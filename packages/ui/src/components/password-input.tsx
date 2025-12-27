"use client";

import { Button } from "@lms/ui/components/button";
import { Input } from "@lms/ui/components/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export const PasswordInput = ({ className, ...props }: React.ComponentProps<"input">) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        className={cn("bg-background", className)}
        id="password-toggle"
        placeholder="Enter your password"
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <Button
        className="absolute top-0 end-0 h-full px-3 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};
