"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase">Error</p>
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong.</h1>
        <p className="text-sm text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
        <button onClick={() => reset()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}
