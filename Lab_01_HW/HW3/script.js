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