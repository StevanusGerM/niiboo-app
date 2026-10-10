import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { GUEST_COOKIE } from "@/lib/guest";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";

/** Pages reachable without an account or guest mode. */
const AUTH_PAGES = ["/welcome", "/login", "/signup"];
const ALWAYS_PUBLIC = ["/auth", "/api"];

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * 1. Keeps the Supabase auth session cookie fresh on every navigation.
 * 2. Sends first-time visitors (not signed in, not a guest) to the welcome screen.
 * 3. Keeps signed-in users away from the welcome/login/signup screens.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  if (startsWithAny(pathname, ALWAYS_PUBLIC)) return response;

  let signedIn = false;
  if (isSupabaseConfigured) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
  }

  const isGuest = request.cookies.get(GUEST_COOKIE)?.value === "1";
  const onAuthPage = startsWithAny(pathname, AUTH_PAGES);

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // carry over any refreshed session cookies
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (signedIn && onAuthPage) return redirectTo("/");
  if (!signedIn && !isGuest && !onAuthPage) return redirectTo("/welcome");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ico|txt)$).*)"],
};
