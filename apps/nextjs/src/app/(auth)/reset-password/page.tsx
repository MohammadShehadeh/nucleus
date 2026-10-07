"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nucleus/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nucleus/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@nucleus/ui/components/field";
import { Input } from "@nucleus/ui/components/input";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "@nucleus/validators/authentication";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (_data: ResetPasswordFormData) => {
    // TODO: Implement actual reset password logic
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Recover Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reset-password-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="reset-password-email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <FieldDescription>
              Remembered your password? <Link href="/login">Login</Link>
            </FieldDescription>
            <Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending reset link..." : "Send reset link"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
