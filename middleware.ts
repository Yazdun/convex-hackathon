import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect as redirect,
} from "@convex-dev/auth/nextjs/server";

const isAuthPage = createRouteMatcher([
  "/get-started",
  "/login",
  "/reset-password",
]);
const isProtectedRoute = createRouteMatcher(["/chats"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (isAuthPage(request) && isAuthenticated) return redirect(request, "/");

  if (isProtectedRoute(request) && !isAuthenticated)
    return redirect(request, "/login");
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
