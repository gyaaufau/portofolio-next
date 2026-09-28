"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main id="main-content" className="editorial-state"><span>CONNECTION LOST</span><h1>The portfolio could not load.</h1><p>The data source may be taking a break. Try loading this screen again.</p><button onClick={() => unstable_retry()} className="editorial-button editorial-button-dark">Try again</button></main>;
}
