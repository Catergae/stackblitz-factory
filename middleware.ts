import { next } from "@vercel/edge";

export const config = {
  matcher: "/(.*)",
};

export default function middleware(request: Request) {
  const basicAuth = request.headers.get("authorization");
  const USER = "demo";
  const PASS = process.env.SITE_PASSWORD;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1] ?? "";
    const [user, pwd] = atob(authValue).split(":");
    if (user === USER && pwd === PASS) {
      return next(); // ← lascia passare correttamente
    }
  }

  return new Response("Autenticazione richiesta", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Area riservata"',
    },
  });
}