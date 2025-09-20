import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher([
  "/get-started",
  "/login",
  "/reset-password",
]);
const isProtectedRoute = createRouteMatcher(["/", "/server"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isAuthPage(request) && isAuthenticated)
    return nextjsMiddlewareRedirect(request, "/");

  if (isProtectedRoute(request) && !isAuthenticated)
    return nextjsMiddlewareRedirect(request, "/login");
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
