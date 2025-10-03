"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@lms/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lms/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@lms/ui/components/form";
import { Input } from "@lms/ui/components/input";
import { cn } from "@lms/ui/lib/utils";
import type { ResetPasswordFormData } from "@lms/validators/authentication";
import { resetPasswordSchema } from "@lms/validators/authentication";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm<ResetPasswordFormData>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (_data: ResetPasswordFormData) => {
    // TODO: Implement actual reset password logic
  };

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Recover Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm">
                Remembered your password?{" "}
                <Link href="/sign-in" className="underline-offset-4 hover:underline">
                  Log in
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending reset link..." : "Send reset link"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
