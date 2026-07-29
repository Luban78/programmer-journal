const CACHE_NAME = "programmer-journal-v5";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./terminal.html",
  "./git.html",
  "./html.html",
  "./css.html",
  "./javascript.html",
  "./meInfo.html",
  "./git/git-status.html",
  "./git/git-add.html",
  "./git/git-commit.html",
  "./git/git-push.html",
  "./git/git-pull.html",
  "./git/git-switch.html",
  "./git/git-branch.html",
  "./git/git-log.html",
  "./html/html-zakladni-struktura.html",
  "./html/html-nadpisy-odstavce.html",
  "./html/html-seznamy.html",
  "./html/html-odkazy.html",
  "./html/html-obrazky.html",
  "./html/html-tlacitka-inputy.html",
  "./html/html-formulare.html",
  "./html/html-tridy-id.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseCopy = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseCopy);
        });

        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
