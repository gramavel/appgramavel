import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return false;

  const hostname = window.location.hostname;
  const isLovablePreviewHost =
    hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");

  if (import.meta.env.PROD && !isLovablePreviewHost) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado:", registration.scope);
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
    return false;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  return hadController || registrations.length > 0;
}

setupServiceWorker()
  .then((shouldReload) => {
    const reloadFlag = "__gramavel_sw_dev_reload_done__";

    if (shouldReload && !sessionStorage.getItem(reloadFlag)) {
      sessionStorage.setItem(reloadFlag, "1");
      window.location.reload();
      return;
    }

    sessionStorage.removeItem(reloadFlag);
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch((error) => {
    console.error("Falha ao inicializar Service Worker em dev:", error);
    createRoot(document.getElementById("root")!).render(<App />);
  });
