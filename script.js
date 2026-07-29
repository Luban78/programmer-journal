const projectScript = document.currentScript;

const projectRootUrl = projectScript ?
  new URL("./", projectScript.src) :
  new URL("./", location.href);

const homeUrl = new URL("index.html", projectRootUrl).href;

const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

if (
  "serviceWorker" in navigator &&
  !isLocalhost &&
  location.protocol === "https:"
) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL(
      "service-worker.js",
      projectRootUrl,
    );
    
    navigator.serviceWorker
      .register(serviceWorkerUrl.pathname)
      .then(() => {
        console.log("Service worker je zaregistrovaný.");
      })
      .catch((error) => {
        console.error(
          "Registrace service workeru selhala:",
          error,
        );
      });
  });
}

function isLessonCompleted(lessonName) {
  return (
    localStorage.getItem(`lesson-${lessonName}`) ===
    "completed"
  );
}

function updateChapterProgress(lessonList) {
  const chapterName = lessonList.dataset.chapter;
  const lessons =
    lessonList.querySelectorAll("li[data-lesson]");
  
  let completedLessons = 0;
  
  lessons.forEach((lesson) => {
    const lessonName = lesson.dataset.lesson;
    const completed = isLessonCompleted(lessonName);
    const status =
      lesson.querySelector(".lesson-status");
    
    lesson.classList.toggle(
      "is-completed",
      completed,
    );
    
    if (status) {
      status.setAttribute(
        "aria-label",
        completed ?
        "Lekce je dokončená" :
        "Lekce zatím není dokončená",
      );
    }
    
    if (completed) {
      completedLessons += 1;
    }
  });
  
  const progressBox = document.querySelector(
    `.chapter-progress[data-progress-for="${chapterName}"]`,
  );
  
  if (!progressBox) {
    return;
  }
  
  const progressText =
    progressBox.querySelector(".progress-text");
  
  const progressBar =
    progressBox.querySelector("progress");
  
  if (progressText) {
    progressText.textContent =
      `${completedLessons} / ${lessons.length} lekcí`;
  }
  
  if (progressBar) {
    progressBar.value = completedLessons;
    progressBar.max = lessons.length;
  }
}

document
  .querySelectorAll(".lesson-list[data-chapter]")
  .forEach((lessonList) => {
    updateChapterProgress(lessonList);
  });

const completeLessonButton =
  document.querySelector(".complete-lesson");

if (completeLessonButton) {
  const lessonName =
    completeLessonButton.dataset.lesson;
  
  if (isLessonCompleted(lessonName)) {
    completeLessonButton.classList.add(
      "is-completed",
    );
    
    completeLessonButton.textContent =
      "🟢 Lekce je dokončena";
  }
  
  completeLessonButton.addEventListener(
    "click",
    () => {
      localStorage.setItem(
        `lesson-${lessonName}`,
        "completed",
      );
      
      completeLessonButton.classList.add(
        "is-completed",
      );
      
      completeLessonButton.textContent =
        "🟢 Lekce je dokončena";
    },
  );
}

function isHomePage() {
  const currentPath =
    location.pathname.replace(
      /\/index\.html$/,
      "/",
    );
  
  const rootPath =
    new URL(homeUrl).pathname.replace(
      /\/index\.html$/,
      "/",
    );
  
  return currentPath === rootPath;
}

function installLessonBackGuard() {
  if (isHomePage()) {
    return;
  }
  
  if (
    history.state?.programmerJournalGuard === true
  ) {
    return;
  }
  
  history.replaceState(
    {
      programmerJournalPage: "lesson",
    },
    "",
    location.href,
  );
  
  history.pushState(
    {
      programmerJournalGuard: true,
    },
    "",
    location.href,
  );
}

function handleAndroidBack() {
  if (isHomePage()) {
    return;
  }
  
  location.replace(homeUrl);
}

installLessonBackGuard();

window.addEventListener(
  "pageshow",
  installLessonBackGuard,
);

window.addEventListener(
  "popstate",
  handleAndroidBack,
);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.hasAttribute("download") ||
    link.target === "_blank"
  ) {
    return;
  }
  
  const rawHref = link.getAttribute("href");
  
  if (
    !rawHref ||
    rawHref.startsWith("#")
  ) {
    return;
  }
  
  const targetUrl = new URL(
    link.href,
    location.href,
  );
  
  if (
    targetUrl.origin !== location.origin ||
    !targetUrl.href.startsWith(
      projectRootUrl.href,
    )
  ) {
    return;
  }
  
  event.preventDefault();
  
  location.replace(targetUrl.href);
});