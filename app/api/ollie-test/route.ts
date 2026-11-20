import { getCurrentUser } from "@/lib/supabase/server";

// A one-line check that Ollie's brain is reachable: it sends a tiny prompt to
// the Claude API and returns the reply. Signed-in people only, so nobody else
// can spend credits. The key is read from the server's environment and is
// never returned, logged or written to code.

const MODEL = "claude-haiku-5-5";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "ANTHROPIC_API_KEY is not set in this environment." },
      { status: 500 },
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 60,
      messages: [
        {
          role: "user",
          content: "You are Ollie. In one short, friendly sentence, say hello to Dustin and Zoey.",
        },
      ],
    }),
  });

  if (!res.ok) {
    // Pass along Anthropic's status only, not the request or any headers.
    return Response.json(
      { ok: false, error: `Claude API returned ${res.status}.` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const text = data?.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  return Response.json({
    ok: true,
    environment: process.env.VERCEL_ENV ?? "local",
    model: MODEL,
    reply: text,
  });
}
