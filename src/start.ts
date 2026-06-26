import { createStart, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";

// --- CONTROLLO DELLA SESSIONE (SOLO BROWSER) ---
if (typeof window !== "undefined") {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("login") === "1") {
    // Se l'utente ha appena effettuato il login, attiva la sessione nella scheda corrente
    sessionStorage.setItem("site_session", "active");

    // Pulisce l'URL rimuovendo "?login=1" per estetica
    urlParams.delete("login");
    const cleanUri =
      window.location.pathname +
      (urlParams.toString() ? "?" + urlParams.toString() : "");
    window.history.replaceState(null, "", cleanUri);
  } else if (!sessionStorage.getItem("site_session")) {
    // Se non c'è una sessione attiva in questa scheda, forza il logout sul server
    window.location.href = "/_logout";
  }
}
// ------------------------------------------------

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));