import { Suspense } from "react";
import { redirect } from "next/navigation";
import { deleteCapture, signOut } from "@/app/actions";
import { CaptureForm } from "@/app/capture-form";
import { HOUSEHOLD_TIME_ZONE, isConfigured } from "@/lib/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default function HomePage() {
  return (
    <main className="shell">
      <header className="masthead">
        <p className="wordmark">Ollie</p>
        <h1>Quick capture</h1>
      </header>
      {/* The sign-in session is read at request time, so everything that
          depends on it streams in behind this boundary. */}
      <Suspense fallback={<p className="muted">Loading your captures…</p>}>
        <Home />
      </Suspense>
    </main>
  );
}

type Capture = {
  id: string;
  owner_id: string;
  body: string;
  visibility: "private" | "shared";
  created_at: string;
};

async function Home() {
  if (!isConfigured) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [profiles, captures] = await Promise.all([
    supabase.from("profiles").select("id, display_name"),
    supabase
      .from("captures")
      .select("id, owner_id, body, visibility, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const names = new Map<string, string>(
    (profiles.data ?? []).map((p) => [p.id, p.display_name]),
  );
  const myName = names.get(user.id) || user.email;
  const rows = (captures.data ?? []) as Capture[];

  return (
    <>
      <div className="row">
        <p className="muted">Signed in as {myName}</p>
        <form action={signOut}>
          <button type="submit" className="link-button">
            Sign out
          </button>
        </form>
      </div>

      <CaptureForm />

      <section aria-labelledby="recent-heading" className="stack">
        <h2 id="recent-heading">Recent</h2>
        {captures.error ? (
          <p className="notice" role="alert">
            Ollie couldn&apos;t load captures. The database may not be set up
            yet.
          </p>
        ) : rows.length === 0 ? (
          <p className="muted">
            Nothing captured yet. Your first thought goes in the box above.
          </p>
        ) : (
          <ul className="list">
            {rows.map((capture) => {
              const mine = capture.owner_id === user.id;
              return (
                <li key={capture.id} className="card">
                  <p className="capture-body">{capture.body}</p>
                  <div className="row">
                    <p className="muted small">
                      {formatWhen(capture.created_at)}
                      {" · "}
                      {capture.visibility === "shared"
                        ? mine
                          ? "Shared by you"
                          : `Shared by ${names.get(capture.owner_id) || "your partner"}`
                        : "Private"}
                    </p>
                    {mine ? (
                      <form action={deleteCapture}>
                        <input type="hidden" name="id" value={capture.id} />
                        <button type="submit" className="link-button">
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: HOUSEHOLD_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
