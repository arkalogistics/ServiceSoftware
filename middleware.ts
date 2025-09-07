export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/api/projects/:path*", "/api/kyc/:path*", "/api/documents/:path*"],
};
