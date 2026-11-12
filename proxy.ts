import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/env";

// Runs before every page request. It keeps the sign-in session fresh and sends
// signed-out visitors to the sign-in page. This is a convenience redirect, not
// the security boundary: the database's row-level security is.
export async function proxy(request: NextRequest) {
  if (!isConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run code between creating the client and this call: it is what
  // refreshes an expiring session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const onLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!signedIn && !onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  if (signedIn && onLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

// Carry refreshed session cookies over to a redirect response.
function withCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

export const config = {
  // Pages only. API routes check sign-in themselves; static files need none.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
