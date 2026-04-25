import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import App from "./App.tsx";
import "./index.css";

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isLovablePreviewHost() {
  const h = window.location.hostname;
  return (
    h.includes("id-preview--") ||
    h.endsWith(".lovableproject.com") ||
    h.endsWith(".lovable.app") === false
      ? false
      : h.includes("id-preview--") || h.endsWith(".lovableproject.com")
  );
}

// Simpler check: only register SW in production AND not in iframe AND not in dev preview
function shouldRegisterSW() {
  if (!("serviceWorker" in navigator)) return false;
  if (!import.meta.env.PROD) return false;
  if (isInIframe()) return false;
  const h = window.location.hostname;
  if (h.includes("id-preview--") || h.endsWith(".lovableproject.com")) return false;
  return true;
}

async function unregisterAllSW() {
  if (!("serviceWorker" in navigator)) return false;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  return regs.length > 0;
}

function notifyUpdateReady(registration: ServiceWorkerRegistration) {
  const waiting = registration.waiting;
  if (!waiting) return;
  toast("Nova versão disponível", {
    description: "Atualize para ver as últimas melhorias.",
    duration: Infinity,
    action: {
      label: "Atualizar",
      onClick: () => {
        waiting.postMessage("SKIP_WAITING");
      },
    },
  });
}

async function setupServiceWorker() {
  if (!shouldRegisterSW()) {
    // In preview/iframe/dev: ensure no leftover SW interferes
    const had = await unregisterAllSW();
    return had;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });

    // If a worker is already waiting, prompt immediately
    if (registration.waiting) notifyUpdateReady(registration);

    // Detect future updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          notifyUpdateReady(registration);
        }
      });
    });

    // Reload once when the new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Periodic update check (every 30 min while open)
    setInterval(() => registration.update().catch(() => {}), 30 * 60 * 1000);

    // Log active SW version for diagnostics
    const logVersion = () => {
      const target = navigator.serviceWorker.controller || registration.active;
      if (!target) return;
      try {
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => {
          console.log("[SW] versão ativa:", e.data);
        };
        target.postMessage({ type: "GET_VERSION" }, [channel.port2]);
      } catch {
        // ignore
      }
    };
    if (registration.active) logVersion();
    navigator.serviceWorker.ready.then(logVersion).catch(() => {});
  } catch (error) {
    console.error("Falha ao registrar Service Worker:", error);
  }
  return false;
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
  .catch(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
