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
  FieldSeparator,
} from "@nucleus/ui/components/field";
import { Input } from "@nucleus/ui/components/input";
import { PasswordInput } from "@nucleus/ui/components/password-input";
import { type RegisterFormData, registerSchema } from "@nucleus/validators/authentication";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn, signUp } from "@/auth/client";
import { authErrorKey, getErrorMessage } from "@/lib/error-messages";

export default function RegisterPage() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formValues: RegisterFormData) => {
    await signUp.email(
      {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully");
        },
        onError: (ctx) => {
          toast.error(getErrorMessage(authErrorKey(ctx.error)));
        },
      }
    );
  };

  const onSignInWithGoogle = async () => {
    await signIn.social(
      {
        provider: "google",
        callbackURL: "/",
      },
      {
        onError: (ctx) => {
          toast.error(getErrorMessage(authErrorKey(ctx.error)));
        },
      }
    );
  };

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>Register with your Email or Google account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-6">
            <Field>
              <Button variant="outline" type="button" onClick={onSignInWithGoogle}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Register with Google
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or create an account with
            </FieldSeparator>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-name">Full Name</FieldLabel>
                  <Input
                    {...field}
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="register-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-confirm-password">Confirm Password</FieldLabel>
                  <PasswordInput
                    {...field}
                    id="register-confirm-password"
                    autoComplete="new-password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Register"}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Login</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
