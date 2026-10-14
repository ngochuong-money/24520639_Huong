"use strict";

/* =========================================================
   STEP 2 — Polyphonic Audio Playback Engine
   ========================================================= */

function playSound(soundPath) {
    if (!soundPath) return;

    // Create a new audio instance for every playback.
    // This allows multiple sounds to overlap.
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