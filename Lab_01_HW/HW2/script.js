"use strict";

/* =========================================================
   STEP 2 — Polyphonic Audio Playback Engine
   ========================================================= */

function playSound(soundPath) {
    if (!soundPath) return;



    const audio = new Audio(soundPath);

    audio.play().catch((error) => {
        console.error("Unable to play sound:", error);
    });
}

function playPad(pad) {
    if (!pad) return;

    const soundPath = pad.dataset.sound;

    playSound(soundPath);
    recordBeat(pad);
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
    console.log(
        "key =", event.key,
        "code =", event.code,
        "repeat =", event.repeat
    );
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
window.addEventListener("blur", () => {
    pressedKeys.clear();
});

/* =========================================================
   STEP 4 — FIFO Beat Recorder
   ========================================================= */

const beatQueue = [];
let recordingStartTime = null;

function recordBeat(pad) {
    if (!pad) return;

    if (recordingStartTime === null) {
        recordingStartTime = performance.now();
    }

    const beatEvent = {
        key: pad.dataset.key,
        sound: pad.dataset.sound,
        timestamp: Math.round(
            performance.now() - recordingStartTime
        )
    };

    beatQueue.push(beatEvent);

    console.log("Recorded beat:", beatEvent);
    console.log("Beat queue:", [...beatQueue]);
}