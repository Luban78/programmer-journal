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
// checkbox 
const lessonCheckboxes = document.querySelectorAll(
  '.lesson-list input[type="checkbox"]',
);

const progressText = document.getElementById("git-progress-text");
const progressBar = document.getElementById("git-progress");

function updateGitProgress() {
  const completedLessons = document.querySelectorAll(
    '.lesson-list input[type="checkbox"]:checked',
  ).length;

  if (progressText) {
    progressText.textContent = `${completedLessons} / ${lessonCheckboxes.length} lekcí`;
  }

  if (progressBar) {
    progressBar.value = completedLessons;
    progressBar.max = lessonCheckboxes.length;
  }
}

lessonCheckboxes.forEach((checkbox) => {
  const lessonName = checkbox.dataset.lesson;
  const savedValue = localStorage.getItem(`lesson-${lessonName}`);

  checkbox.checked = savedValue === "completed";

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      localStorage.setItem(`lesson-${lessonName}`, "completed");
    } else {
      localStorage.removeItem(`lesson-${lessonName}`);
    }

    updateGitProgress();
  });
});

updateGitProgress();

// button lekce splnena
const lekceSplnena = document.querySelector(".complete-lesson");

if (lekceSplnena) {
  lekceSplnena.addEventListener("click", function () {
    const nazevLekce = lekceSplnena.dataset.lesson;

    localStorage.setItem(`lesson-${nazevLekce}`, "completed");

    alert("Lekce byla označena jako dokončená.");
  });
}