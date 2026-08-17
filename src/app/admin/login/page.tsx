"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <p className="text-sm text-muted-foreground">Enter password to continue</p>
          </CardHeader>
          <form action={formAction}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter admin password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              {state?.error && (
                <p className="text-sm text-destructive w-full">{state.error}</p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
