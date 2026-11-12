import type { Metadata } from "next";
import { isConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="shell shell-narrow">
      <header className="masthead">
        <p className="wordmark">Ollie</p>
        <h1>Sign in</h1>
        <p className="muted">
          Accounts are set up by the household. There&apos;s no sign-up here.
        </p>
      </header>
      {isConfigured ? (
        <LoginForm />
      ) : (
        <p className="notice" role="alert">
          Ollie isn&apos;t connected to its database yet. Add
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in
          the host&apos;s settings, then redeploy.
        </p>
      )}
    </main>
  );
}
