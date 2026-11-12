"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "@/app/actions";

const initialState: FormState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="card stack">
      <label className="field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="button" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
