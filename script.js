const projectScript = document.currentScript;
const projectRootUrl = projectScript
  ? new URL("./", projectScript.src)
  : new URL("./", location.href);
const homeUrl = new URL("index.html", projectRootUrl).href;

const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

if ("serviceWorker" in navigator && !isLocalhost && location.protocol === "https:") {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("service-worker.js", projectRootUrl);

    navigator.serviceWorker
      .register(serviceWorkerUrl.pathname)
      .then(() => {
        console.log("Service worker je zaregistrovaný.");
      })
      .catch((error) => {
        console.error("Registrace service workeru selhala:", error);
      });
  });
}

function isLessonCompleted(lessonName) {
  return localStorage.getItem(`lesson-${lessonName}`) === "completed";
}

function updateChapterProgress(lessonList) {
  const chapterName = lessonList.dataset.chapter;
  const lessons = lessonList.querySelectorAll("li[data-lesson]");
  let completedLessons = 0;

  lessons.forEach((lesson) => {
    const lessonName = lesson.dataset.lesson;
    const completed = isLessonCompleted(lessonName);
    const status = lesson.querySelector(".lesson-status");

    lesson.classList.toggle("is-completed", completed);

    if (status) {
      status.setAttribute(
        "aria-label",
        completed ? "Lekce je dokončená" : "Lekce zatím není dokončená",
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

  const progressText = progressBox.querySelector(".progress-text");
  const progressBar = progressBox.querySelector("progress");

  if (progressText) {
    progressText.textContent = `${completedLessons} / ${lessons.length} lekcí`;
  }

  if (progressBar) {
    progressBar.value = completedLessons;
    progressBar.max = lessons.length;
  }
}

document.querySelectorAll(".lesson-list[data-chapter]").forEach((lessonList) => {
  updateChapterProgress(lessonList);
});

const completeLessonButton = document.querySelector(".complete-lesson");

if (completeLessonButton) {
  const lessonName = completeLessonButton.dataset.lesson;

  if (isLessonCompleted(lessonName)) {
    completeLessonButton.classList.add("is-completed");
    completeLessonButton.textContent = "🟢 Lekce je dokončena";
  }

  completeLessonButton.addEventListener("click", () => {
    localStorage.setItem(`lesson-${lessonName}`, "completed");
    completeLessonButton.classList.add("is-completed");
    completeLessonButton.textContent = "🟢 Lekce je dokončena";
  });
}

function isHomePage() {
  const currentPath = location.pathname.replace(/\/index\.html$/, "/");
  const rootPath = new URL(homeUrl).pathname.replace(/\/index\.html$/, "/");
  return currentPath === rootPath;
}

function createBackToast() {
  const toast = document.createElement("div");
  toast.className = "back-toast";
  toast.setAttribute("role", "status");
  toast.textContent = "Stiskni zpět ještě jednou pro nabídku ukončení.";
  document.body.appendChild(toast);
  return toast;
}

function createExitModal() {
  const modal = document.createElement("div");
  modal.className = "exit-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="exit-modal__backdrop"></div>
    <section class="exit-modal__card" role="dialog" aria-modal="true" aria-labelledby="exit-modal-title">
      <h2 id="exit-modal-title">Vypnout aplikaci?</h2>
      <p>Chceš ukončit Programmer Journal?</p>
      <div class="exit-modal__actions">
        <button type="button" class="exit-modal__stay">Zůstat</button>
        <button type="button" class="exit-modal__leave">Vypnout</button>
      </div>
    </section>
  `;
  document.body.appendChild(modal);
  return modal;
}

const backToast = createBackToast();
const exitModal = createExitModal();
const stayButton = exitModal.querySelector(".exit-modal__stay");
const leaveButton = exitModal.querySelector(".exit-modal__leave");
const modalBackdrop = exitModal.querySelector(".exit-modal__backdrop");
let lastBackPress = 0;
let backPressTimer;
let allowExit = false;

function installBackGuard() {
  if (!history.state || history.state.programmerJournalGuard !== true) {
    history.pushState({ programmerJournalGuard: true }, "", location.href);
  }
}

function showBackToast() {
  backToast.classList.add("is-visible");
  window.setTimeout(() => {
    backToast.classList.remove("is-visible");
  }, 1700);
}

function showExitModal() {
  backToast.classList.remove("is-visible");
  exitModal.hidden = false;
  stayButton.focus();
}

function hideExitModal() {
  exitModal.hidden = true;
  lastBackPress = 0;
}

function handleAndroidBack() {
  if (allowExit) {
    return;
  }

  if (!isHomePage()) {
    location.replace(homeUrl);
    return;
  }

  installBackGuard();

  const now = Date.now();

  if (now - lastBackPress <= 1800) {
    window.clearTimeout(backPressTimer);
    lastBackPress = 0;
    showExitModal();
    return;
  }

  lastBackPress = now;
  showBackToast();

  window.clearTimeout(backPressTimer);
  backPressTimer = window.setTimeout(() => {
    lastBackPress = 0;
  }, 1800);
}

function leaveApplication() {
  allowExit = true;
  exitModal.hidden = true;
  window.removeEventListener("popstate", handleAndroidBack);

  window.close();

  window.setTimeout(() => {
    history.go(-2);
  }, 80);
}

installBackGuard();
window.addEventListener("pageshow", installBackGuard);
window.addEventListener("popstate", handleAndroidBack);

stayButton.addEventListener("click", hideExitModal);
modalBackdrop.addEventListener("click", hideExitModal);
leaveButton.addEventListener("click", leaveApplication);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !exitModal.hidden) {
    hideExitModal();
  }
});

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

  if (!rawHref || rawHref.startsWith("#")) {
    return;
  }

  const targetUrl = new URL(link.href, location.href);

  if (
    targetUrl.origin !== location.origin ||
    !targetUrl.href.startsWith(projectRootUrl.href)
  ) {
    return;
  }

  event.preventDefault();
  location.replace(targetUrl.href);
});
