"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main id="main-content" className="mx-auto grid min-h-[70dvh] max-w-[900px] place-items-center px-5"><div className="pixel-frame pixel-grid max-w-xl bg-card p-8 md:p-12"><p className="text-pixel text-[9px] text-primary">CONNECTION LOST</p><h1 className="mt-6 text-4xl font-semibold tracking-[-0.05em]">The portfolio could not load.</h1><p className="mt-4 leading-7 text-muted-foreground">The data source may be taking a break. Try loading this screen again.</p><button onClick={() => unstable_retry()} className="pixel-button mt-7 bg-primary text-primary-foreground">Try again</button></div></main>;
}
