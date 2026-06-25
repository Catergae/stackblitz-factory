import { next } from "@vercel/edge";

export const config = {
  matcher: "/((?!favicon.ico|_next).*)",
};

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const correctPassword = process.env.SITE_PASSWORD;

  if (!correctPassword) {
    return next();
  }

  // --- NUOVO: Gestione del LOGOUT manuale ---
  // Se l'utente visita /_logout, cancelliamo il cookie e lo rimandiamo alla home (che chiederà la password)
  if (url.pathname === "/_logout") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        // Impostando Max-Age=0 il cookie viene eliminato all'istante
        "Set-Cookie": `site-auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    });
  }

  // 1. Controlla se è presente il cookie di autorizzazione
  const cookieHeader = request.headers.get("cookie") || "";
  const isAuthorized = cookieHeader.includes(`site-auth=${encodeURIComponent(correctPassword)}`);

  if (isAuthorized) {
    return next();
  }

  // 2. Gestisci l'invio del form di login (POST)
  if (request.method === "POST" && url.pathname === "/_login") {
    try {
      const formData = await request.formData();
      const enteredPassword = formData.get("password");

      if (enteredPassword === correctPassword) {
        // Password corretta: reindirizza alla home
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            // MODIFICATO: rimosso "Max-Age". Ora è un Cookie di Sessione.
            // Si cancella automaticamente quando si chiude il browser.
            "Set-Cookie": `site-auth=${encodeURIComponent(correctPassword)}; Path=/; HttpOnly; SameSite=Lax`,
          },
        });
      }
    } catch (e) {
      // Errore nel parsing
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/?error=1",
      },
    });
  }

  // 3. Mostra la schermata di inserimento password
  const hasError = url.searchParams.has("error");
  
  const loginHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Accesso Limitato</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0a0a0a;
          color: #ededed;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background: #121212;
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid #262626;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 360px;
          text-align: center;
        }
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          letter-spacing: -0.05em;
        }
        p {
          color: #a3a3a3;
          font-size: 0.875rem;
          margin-bottom: 2rem;
        }
        input[type="password"] {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #262626;
          background: #0a0a0a;
          color: #fff;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 1rem;
          transition: border-color 0.15s ease;
        }
        input[type="password"]:focus {
          outline: none;
          border-color: #a3a3a3;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        button:hover {
          background: #e5e5e5;
        }
        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Area Riservata</h1>
        <p>Inserisci la password per visualizzare il mockup.</p>
        <form action="/_login" method="POST">
          <input type="password" name="password" placeholder="Password" required autofocus />
          <button type="submit">Accedi</button>
        </form>
        ${hasError ? '<div class="error-message">Password errata. Riprova.</div>' : ''}
      </div>
    </body>
    </html>
  `;

  return new Response(loginHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}