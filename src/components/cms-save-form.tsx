"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { CmsSaveAction } from "@/lib/cms-content";
import { useRouter } from "next/navigation";

const SavingContext = createContext(false);

/** Keep the form mounted, including uncontrolled fields, when saving fails. */
export function CmsSaveForm({ action, successHref, className, onChange, children }: {
  action: CmsSaveAction;
  successHref?: string;
  className?: string;
  onChange?: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return <SavingContext.Provider value={pending}>
    <form onChange={onChange} className={className} aria-busy={pending} onSubmit={async (event) => {
      event.preventDefault();
      if (inFlight.current) return;
      const data = new FormData(event.currentTarget);
      inFlight.current = true;
      setPending(true);
      setError("");
      setMessage("");
      try {
        const result = await action(data);
        if (result?.error) { setError(result.error); return; }
        setMessage("Changes saved. Your site is up to date.");
        if (successHref) router.push(successHref);
        router.refresh();
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : "Unable to save changes. Please try again.");
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    }}>
      {error && <div className="cms-save-notice cms-flash cms-save-error" role="alert">{error}</div>}
      {message && <div className="cms-save-notice cms-flash" role="status">{message}</div>}
      <fieldset disabled={pending} className="cms-save-fields">{children}</fieldset>
    </form>
  </SavingContext.Provider>;
}

export function CmsSubmitButton({ children }: { children: React.ReactNode }) {
  const pending = useContext(SavingContext);
  return <button type="submit" disabled={pending} className="cms-button cms-button-primary">{pending ? "Saving…" : children}</button>;
}
