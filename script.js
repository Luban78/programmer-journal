const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

if ("serviceWorker" in navigator && !isLocalhost) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Service worker je zaregistrovaný.");
      })
      .catch((error) => {
        console.error("Registrace service workeru selhala:", error);
      });
  });
}