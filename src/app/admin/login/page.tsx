"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../actions";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      const result = await login(formData.get("password") as string);
      if (result.success) {
        router.push("/admin");
        router.refresh();
        return null;
      }
      return { error: result.error ?? "Login failed" };
    },
    null
  );

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter admin password"
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
