"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One message for every failure, so the form doesn't reveal which emails exist.
    return { error: "That email and password didn't match. Try again." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addCapture(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Every action checks sign-in itself and never trusts the page that called it.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const body = String(formData.get("body") ?? "").trim();
  const shared = formData.get("shared") === "on";

  if (!body) {
    return { error: "Type something to capture." };
  }
  if (body.length > 4000) {
    return { error: "That's over 4,000 characters. Trim it or split it in two." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("captures").insert({
    body,
    visibility: shared ? "shared" : "private",
    source: "app",
  });

  if (error) {
    return { error: "Ollie couldn't save that. Nothing was stored; try again." };
  }

  refresh();
  return { error: null };
}

export async function deleteCapture(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  // Row-level security only lets this remove a capture the person owns.
  const supabase = await createClient();
  await supabase.from("captures").delete().eq("id", id);
  refresh();
}
