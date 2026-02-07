"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@nucleus/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nucleus/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nucleus/ui/components/form";
import { Input } from "@nucleus/ui/components/input";
import { cn } from "@nucleus/ui/lib/utils";
import type { ResetPasswordFormData } from "@nucleus/validators/authentication";
import { resetPasswordSchema } from "@nucleus/validators/authentication";
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
