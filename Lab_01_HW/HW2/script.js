"use strict";

/* =========================================================
   STEP 2 — Polyphonic Audio Playback Engine
   ========================================================= */

function playSound(soundPath) {
    if (!soundPath) return;

    console.count("playSound called");

    const audio = new Audio(soundPath);

    audio.play().catch((error) => {
        console.error("Unable to play sound:", error);
    });
}

function playPad(pad) {
    if (!pad) return;

    const soundPath = pad.dataset.sound;

    playSound(soundPath);
}
const drumPads = document.querySelectorAll(".drum-pad");

drumPads.forEach((pad) => {
    pad.addEventListener("click", () => {
        playPad(pad);
    });
});
/* =========================================================
   STEP 3 — Keyboard Input + Repeat Throttling
   ========================================================= */

const pressedKeys = new Set();

function handleKeydown(event) {
    const key = event.key.toLowerCase();

    // Ignore browser-generated repeated keydown events
    if (event.repeat) return;

    // Ignore the key if it is already being held
    if (pressedKeys.has(key)) return;

    const pad = document.querySelector(
        `.drum-pad[data-key="${key}"]`
    );

    if (!pad) return;

    pressedKeys.add(key);
    playPad(pad);
}

function handleKeyup(event) {
    const key = event.key.toLowerCase();
    pressedKeys.delete(key);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);