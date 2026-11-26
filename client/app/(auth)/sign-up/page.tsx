"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, User, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPostAuthRedirectPath } from "@/hooks/use-auth-user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter."),
  role: z.enum(["customer", "technician"]),
});

type SignUpValues = z.infer<typeof signUpSchema>;

function SignUpFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const initialRole =
    searchParams.get("role") === "technician" ? "technician" : "customer";
  const callbackUrl = searchParams.get("callbackUrl");

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: initialRole,
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (values: SignUpValues) => {
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email.toLowerCase(),
        password: values.password,
        role: values.role,
      });

      if (error) {
        toast.error(error.message || "Could not create account.");
        return;
      }

      toast.success("Account created! Welcome to FixMate.");
      const safeCallback =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : null;
      router.push(safeCallback || getPostAuthRedirectPath(values.role));
      router.refresh();
    } catch {
      toast.error("Sign up failed. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const safeCallback =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
      await authClient.signIn.social({
        provider: "google",
        callbackURL: safeCallback,
      });
    } catch {
      toast.error("Google sign-in is not available right now.");
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Join FixMate as a customer or verified repair technician
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection (Customer or Technician only) */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => form.setValue("role", "customer")}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3.5 text-center transition-colors cursor-pointer",
                  selectedRole === "customer"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                )}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-semibold">Customer</span>
                <span className="text-[11px] opacity-80">Book repairs</span>
              </button>

              <button
                type="button"
                onClick={() => form.setValue("role", "technician")}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3.5 text-center transition-colors cursor-pointer",
                  selectedRole === "technician"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                )}
              >
                <Wrench className="h-5 w-5" />
                <span className="text-sm font-semibold">Technician</span>
                <span className="text-[11px] opacity-80">Offer services</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Alex Rivera"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 chars, uppercase & lowercase"
                className="pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={googleLoading}
          onClick={handleGoogleSignUp}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          <span>Continue with Google (Customer)</span>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={
              callbackUrl
                ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/sign-in"
            }
            className="font-semibold text-brand hover:underline"
          >
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      }
    >
      <SignUpFormInner />
    </React.Suspense>
  );
}
