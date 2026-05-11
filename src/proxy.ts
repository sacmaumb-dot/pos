import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/signup", "/api/register", "/admin-login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("shop_session_token")?.value;
  const hostname = req.headers.get("host") || "";
  
  // Extract subdomain (e.g., applecare.localhost:3000 -> applecare)
  let subdomain = "";
  const domains = ["localhost:3000", "127.0.0.1:3000", "localhost:3001", "127.0.0.1:3001", "mypos.vn"];
  
  for (const domain of domains) {
    if (hostname === domain) {
      subdomain = "";
      break;
    }
    if (hostname.endsWith(`.${domain}`)) {
      subdomain = hostname.replace(`.${domain}`, "");
      break;
    }
  }

  // Inject subdomain slug as a custom header
  const requestHeaders = new Headers(req.headers);
  if (subdomain && subdomain !== "www" && subdomain !== "api") {
    requestHeaders.set("x-tenant-slug", subdomain);
  } else {
    requestHeaders.delete("x-tenant-slug");
  }

  // Allow root domain landing page
  const isRootDomain = !subdomain || subdomain === "www" || subdomain === "api";
  
  if (isRootDomain && (pathname === "/" || pathname === "/signup")) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // Redirect logged-in users on subdomains to dashboard if hitting root path
  if (!isRootDomain && pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // Allow assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
