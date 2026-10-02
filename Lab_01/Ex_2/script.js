"use strict";

/* =========================================================
   Exercise 2 — Enterprise Developer Portfolio
   SUB-TASK T-02C: Theme Engine
   ========================================================= */

const THEME_KEY = "theme";
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

const themeToggle = document.getElementById("theme-toggle");


/* =========================
   APPLY THEME
   ========================= */

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    if (themeToggle) {
        const isDark = theme === DARK_THEME;

        themeToggle.setAttribute("aria-pressed", String(isDark));

        themeToggle.textContent = isDark
            ? "☀ Switch to light mode"
            : "☾ Switch to dark mode";
    }
}


/* =========================
   LOAD SAVED THEME
   ========================= */

function getSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (
        savedTheme === LIGHT_THEME ||
        savedTheme === DARK_THEME
    ) {
        return savedTheme;
    }

    return LIGHT_THEME;
}


/* =========================
   SAVE THEME
   ========================= */

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}


/* =========================
   TOGGLE THEME
   ========================= */

function toggleTheme() {
    const currentTheme =
        document.documentElement.dataset.theme;

    const nextTheme =
        currentTheme === DARK_THEME
            ? LIGHT_THEME
            : DARK_THEME;

    applyTheme(nextTheme);
    saveTheme(nextTheme);
}


/* =========================
   INITIALIZE THEME
   ========================= */

applyTheme(getSavedTheme());


/* =========================
   THEME TOGGLE EVENT
   ========================= */

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}


/* =========================================================
   Exercise 3 — Contact Form State Handling
   ========================================================= */

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const contactState = {
    submitted: false
};

function handleContactSubmit(event) {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    contactState.submitted = true;

    if (formStatus) {
        formStatus.textContent = "Message submitted successfully.";
    }

    contactForm.reset();
}

if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
}

// Decoupled Audio Engine Logic
function playSound(key) {
  const pad = document.querySelector(
    `.drum-pad[data-key="${key.toLowerCase()}"]`
  );

  if (!pad) return;

  const soundPath = pad.dataset.sound;
  if (!soundPath) return;

  const audio = new Audio(soundPath);
  audio.currentTime = 0;
  audio.play();

  pad.classList.add("active");

  setTimeout(() => {
    pad.classList.remove("active");
  }, 100);
}