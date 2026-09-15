// Next.js 16 renamed Middleware to Proxy. next-intl's middleware factory is the
// same function; it just lives in this file now. It sends "/" to "/en" or "/ar"
// based on the visitor's Accept-Language header or a saved cookie.
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
