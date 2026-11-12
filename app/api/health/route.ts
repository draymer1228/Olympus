import { environmentName, isConfigured } from "@/lib/env";

// A plain status check: is the app deployed, and does it have its settings?
// It reports no data and needs no sign-in.
export async function GET() {
  return Response.json({
    ok: true,
    environment: environmentName,
    databaseConfigured: isConfigured,
  });
}
