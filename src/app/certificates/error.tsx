"use client";

import { useEffect } from "react";

export default function CertificatesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main id="main-content" className="editorial-state"><span>CONNECTION LOST</span><h1>Certificates could not load.</h1><p>The data source may be taking a break. Try loading this screen again.</p><button onClick={() => reset()} className="editorial-button editorial-button-dark">Try again</button></main>
  );
}
