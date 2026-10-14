"use strict";

/* =========================================================
   SLICE 1 — Drift-Free Countdown Engine
   ========================================================= */

const countdownElement = document.getElementById("countdown");

// UTC ISO 8601 timestamp
const EVENT_TIME = "2026-12-01T00:00:00Z";

function getTimeRemaining() {
    const now = Date.now();
    const target = new Date(EVENT_TIME).getTime();

    return target - now;
}

function updateCountdown() {
    const remaining = getTimeRemaining();

    if (remaining <= 0) {
        countdownElement.textContent = "Event started.";
        return;
    }

    const totalSeconds = Math.floor(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

updateCountdown();

setInterval(updateCountdown, 1000);

/* =========================================================
   SLICE 2 — State-Machine Form
   ========================================================= */

const registrationForm =
    document.getElementById("registration-form");

const submitButton =
    document.getElementById("submit-button");

const formStatus =
    document.getElementById("form-status");

const FORM_STATE = {
    IDLE: "idle",
    SUBMITTING: "submitting",
    SUCCESS: "success",
    ERROR: "error"
};

let currentFormState = FORM_STATE.IDLE;

function setFormState(state) {
    currentFormState = state;

    switch (state) {
        case FORM_STATE.IDLE:
            submitButton.disabled = false;
            submitButton.textContent = "Register";
            formStatus.textContent = "Ready to submit.";
            break;

        case FORM_STATE.SUBMITTING:
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
            formStatus.textContent = "Submitting registration...";
            break;

        case FORM_STATE.SUCCESS:
            submitButton.disabled = false;
            submitButton.textContent = "Register";
            formStatus.textContent =
                "Registration successful.";
            break;

        case FORM_STATE.ERROR:
            submitButton.disabled = false;
            submitButton.textContent = "Try Again";
            formStatus.textContent =
                "Registration failed. Please try again.";
            break;
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    setFormState(FORM_STATE.SUBMITTING);

    try {
        // Simulate an async request
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });

        setFormState(FORM_STATE.SUCCESS);
        registrationForm.reset();

    } catch (error) {
        console.error(error);

        setFormState(FORM_STATE.ERROR);
    }
}

registrationForm.addEventListener(
    "submit",
    handleSubmit
);