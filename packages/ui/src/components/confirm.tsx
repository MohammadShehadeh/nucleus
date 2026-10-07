"use client";

import type { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@nucleus/ui/components/alert-dialog";
import { Button } from "@nucleus/ui/components/button";
import { Spinner } from "@nucleus/ui/components/spinner";
import { createSafeContext } from "@nucleus/ui/lib/create-safe-context";
import { cn } from "@nucleus/ui/lib/utils";
import * as React from "react";

export type ConfirmTone = "default" | "destructive";

export interface ConfirmOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  tone?: ConfirmTone;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const [ConfirmContextProvider, useConfirm] = createSafeContext<ConfirmFn>(
  "useConfirm must be used inside <ConfirmProvider>"
);

interface ConfirmRequest {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

export interface ConfirmProviderProps {
  children: React.ReactNode;
  defaultOptions?: Pick<ConfirmOptions, "confirmText" | "cancelText" | "tone" | "dismissible">;
}

const CLOSE_DURATION = 200;

export const ConfirmProvider = ({ children, defaultOptions }: ConfirmProviderProps) => {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [active, setActive] = React.useState<ConfirmRequest | null>(null);
  const activeRef = React.useRef<ConfirmRequest | null>(null);
  const queueRef = React.useRef<ConfirmRequest[]>([]);
  const closingRef = React.useRef(false);

  const confirm = React.useCallback<ConfirmFn>((options = {}) => {
    return new Promise<boolean>((resolve) => {
      const request: ConfirmRequest = { options, resolve };
      if (activeRef.current) {
        queueRef.current.push(request);
        return;
      }
      activeRef.current = request;
      setActive(request);
      setOpen(true);
    });
  }, []);

  const settle = React.useCallback((value: boolean) => {
    const current = activeRef.current;
    if (!current || closingRef.current) return;
    closingRef.current = true;
    current.resolve(value);
    setPending(false);
    setOpen(false);
    window.setTimeout(() => {
      closingRef.current = false;
      const next = queueRef.current.shift() ?? null;
      activeRef.current = next;
      setActive(next);
      setOpen(next !== null);
    }, CLOSE_DURATION);
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (closingRef.current) return;
    const onConfirm = activeRef.current?.options.onConfirm;
    if (!onConfirm) {
      settle(true);
      return;
    }
    setPending(true);
    Promise.resolve()
      .then(onConfirm)
      .then(
        () => settle(true),
        (error) => {
          setPending(false);
          throw error;
        }
      );
  }, [settle]);

  const options: ConfirmOptions = {
    confirmText: "Confirm",
    cancelText: "Cancel",
    tone: "default",
    dismissible: true,
    ...defaultOptions,
    ...active?.options,
  };

  const tone = options.tone ?? "default";
  const dismissible = options.dismissible ?? true;

  const handleOpenChange = (
    next: boolean,
    details: AlertDialogPrimitive.Root.ChangeEventDetails
  ) => {
    if (next || pending) return;
    if (!dismissible && details.reason === "escape-key") return;
    settle(false);
  };
  const hasDescription = options.description != null;
  const hasTitle = options.title != null && options.title !== "";

  return (
    <ConfirmContextProvider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent data-tone={tone}>
          <AlertDialogHeader>
            {options.icon != null ? (
              <AlertDialogMedia
                className={cn(tone === "destructive" && "bg-destructive/10 text-destructive")}
              >
                {options.icon}
              </AlertDialogMedia>
            ) : null}
            {hasTitle ? (
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
            ) : (
              <AlertDialogTitle className="sr-only">Confirm action</AlertDialogTitle>
            )}
            {hasDescription ? (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{options.cancelText}</AlertDialogCancel>
            <Button
              type="button"
              data-slot="confirm-action"
              data-tone={tone}
              variant={tone === "destructive" ? "destructive" : "default"}
              disabled={pending}
              onClick={handleConfirm}
            >
              {pending ? <Spinner /> : null}
              {options.confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContextProvider>
  );
};

export { useConfirm };
