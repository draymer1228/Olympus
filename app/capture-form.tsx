"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCapture, type FormState } from "@/app/actions";

const initialState: FormState = { error: null };

export function CaptureForm() {
  const [state, action, pending] = useActionState(addCapture, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // Clear the box after a capture saves, and keep it after a failure so
  // nothing typed is lost.
  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={action} className="card stack">
      <label className="field">
        <span>Capture a thought</span>
        <textarea
          name="body"
          rows={3}
          maxLength={4000}
          placeholder="One sentence is enough."
          required
        />
      </label>
      <div className="row">
        <label className="check">
          <input type="checkbox" name="shared" />
          <span>Share with the household</span>
        </label>
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : (
        <p className="muted small">Private to you unless you tick the box.</p>
      )}
    </form>
  );
}
