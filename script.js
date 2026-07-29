const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

if ("serviceWorker" in navigator && !isLocalhost && location.protocol === "https:") {
  window.addEventListener("load", () => {
    const projectScript = document.querySelector('script[src$="script.js"]');

    if (!projectScript) {
      return;
    }

    const serviceWorkerUrl = new URL("service-worker.js", projectScript.src);

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
