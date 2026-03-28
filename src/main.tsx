/* v2 - force reload */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration.scope);
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith("gramavel-")).map((key) => caches.delete(key)),
    );
  }
}

setupServiceWorker()
  .catch((error) => console.error("Falha ao limpar Service Worker em dev:", error))
  .finally(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
