if ("serviceWorker" in navigator) {
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