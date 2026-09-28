"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../actions";
import "../cms.css";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (_: { error?: string } | null, formData: FormData) => {
    const result = await login(String(formData.get("password") || ""));
    if (result.success) { router.push("/admin"); router.refresh(); return null; }
    return { error: result.error ?? "Sign in failed." };
  }, null);
  return <main className="cms-login"><aside className="cms-login-story"><div className="cms-login-brand"><span className="cms-brand-mark">G</span><strong>Studio CMS</strong></div><div><span className="cms-mono">THE PORTFOLIO THAT KEEPS ITSELF ALIVE</span><h1>One workspace for every app, note and screenshot you ship.</h1></div><small>GIALOOP · © {new Date().getFullYear()}</small></aside><section className="cms-login-form"><div className="cms-login-inner"><span className="cms-eyebrow">Sign in</span><h1>Welcome back.</h1><p>Use the admin password to enter your workspace.</p><form action={formAction}><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter admin password" /><button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>{state?.error && <div className="cms-login-error" role="alert">{state.error}</div>}</form><small>PROTECTED WORKSPACE</small></div></section></main>;
}
