
import './style.css';

import { AudioEngine } from './audio/audio-engine';
import { AudioTaskQueue } from './audio/audio-queue-controller';
import { FrequencyVisualizer } from './visualizer/frequency-visualizer';

const engine = new AudioEngine();
const queue = new AudioTaskQueue(engine);

// Application state
let isProcessing = false;
let isClosing = false;
let isSwitching = false;

let decodedTracks: {
  name: string;
  buffer: AudioBuffer;
}[] = [];

let currentTrackIndex: number | null = null;

const trackButtons: HTMLButtonElement[] = [];

// Create interface
const main = document.createElement('main');
main.className = 'audio-app';

const heading = document.createElement('h1');
heading.textContent = 'Audio Frequency Visualizer';

const description = document.createElement('p');
description.textContent = 'Concurrent FIFO Audio Queue Engine';

const uploadLabel = document.createElement('label');
uploadLabel.textContent = 'Choose Audio Files';

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*,.mp3,.wav,.ogg,.m4a';
fileInput.multiple = true;

uploadLabel.append(fileInput);

const canvas = document.createElement('canvas');
canvas.width = 768;
canvas.height = 240;
canvas.setAttribute('role', 'img');
canvas.setAttribute(
  'aria-label',
  'Real-time audio frequency visualization'
);

const nowPlaying = document.createElement('p');
nowPlaying.className = 'now-playing';
nowPlaying.textContent = 'Now Playing: None';

const controls = document.createElement('div');
controls.className = 'controls';

function createButton(text: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  return button;
}

const processButton = createButton('Process Files');
const demoButton = createButton('Run FIFO Demo');
const cancelButton = createButton('Cancel Tasks');
const playButton = createButton('Play Audio');
const stopButton = createButton('Stop Audio');

const fftLabel = document.createElement('label');
fftLabel.textContent = 'FFT Size: ';

const fftSelect = document.createElement('select');

for (const size of [256, 512]) {
  const option = document.createElement('option');
  option.value = String(size);
  option.textContent = String(size);
  fftSelect.append(option);
}

fftLabel.append(fftSelect);

const status = document.createElement('p');
status.setAttribute('role', 'status');
status.textContent = 'Ready — Select audio files to begin';

const resultsHeading = document.createElement('h2');
resultsHeading.textContent = 'Queue Results';

const resultsList = document.createElement('ol');
resultsList.className = 'results';

controls.append(
  processButton,
  demoButton,
  cancelButton,
  playButton,
  stopButton,
  fftLabel
);

main.append(
  heading,
  description,
  uploadLabel,
  canvas,
  nowPlaying,
  controls,
  status,
  resultsHeading,
  resultsList
);

document.body.append(main);

const visualizer = new FrequencyVisualizer(canvas, engine);

// Update button availability
function updateButtons(): void {
  processButton.disabled =
    isProcessing ||
    isClosing ||
    isSwitching ||
    !(fileInput.files?.length);

  demoButton.disabled =
    isProcessing || isClosing || isSwitching;

  cancelButton.disabled = !isProcessing || isClosing;

  playButton.disabled =
    isProcessing ||
    isClosing ||
    isSwitching ||
    decodedTracks.length === 0;

  fileInput.disabled = isProcessing || isClosing;

  for (const button of trackButtons) {
    button.disabled =
      isProcessing || isClosing || isSwitching;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

function stopPlayback(): void {
  visualizer.stop();
  engine.stop();
}

// Play a selected decoded track
async function playTrack(index: number): Promise<void> {
  const track = decodedTracks[index];

  if (
    !track ||
    isProcessing ||
    isClosing ||
    isSwitching
  ) {
    return;
  }

  isSwitching = true;
  updateButtons();

  try {
    stopPlayback();

    await engine.playBuffer(track.buffer);

    if (isClosing) {
      stopPlayback();
      return;
    }

    currentTrackIndex = index;
    visualizer.start();

    nowPlaying.textContent = `Now Playing: ${track.name}`;
    status.textContent = `Playing: ${track.name}`;

    // Highlight the currently selected track.
    trackButtons.forEach(button => {
      const buttonIndex = Number(button.dataset.trackIndex);

      button.textContent =
        buttonIndex === index ? 'Playing' : 'Play';
    });
  } catch (error: unknown) {
    currentTrackIndex = null;
    nowPlaying.textContent = 'Now Playing: None';
    status.textContent =
      `Playback failed: ${errorMessage(error)}`;
  } finally {
    isSwitching = false;
    updateButtons();
  }
}

function createResult(name: string): HTMLLIElement {
  const item = document.createElement('li');
  item.textContent = `${name} — Waiting`;
  resultsList.append(item);
  return item;
}

// Process tracks in FIFO order
async function processTracks(
  tracks: { name: string; url: string }[]
): Promise<void> {
  if (isProcessing || isClosing || isSwitching) {
    for (const track of tracks) {
      if (track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
      }
    }
    return;
  }

  if (tracks.length === 0) return;

  isProcessing = true;
  decodedTracks = [];
  currentTrackIndex = null;
  trackButtons.length = 0;

  stopPlayback();
  nowPlaying.textContent = 'Now Playing: None';

  resultsList.replaceChildren();

  const items = tracks.map(track =>
    createResult(track.name)
  );

  items[0].textContent =
    `${tracks[0].name} — Processing`;

  status.textContent =
    `Processing ${tracks.length} audio files...`;

  updateButtons();

  try {
    // Enqueue all tasks without awaiting each one.
    const promises = tracks.map((track, index) =>
      queue.enqueue(track.url).then(
        buffer => {
          items[index].textContent =
            `${track.name} — Success`;

          return buffer;
        },
        (error: unknown) => {
          const cancelled =
            error instanceof Error &&
            error.name === 'AbortError';

          items[index].textContent = cancelled
            ? `${track.name} — Cancelled`
            : `${track.name} — Failed: ${errorMessage(error)}`;

          throw error;
        }
      ).finally(() => {
        const next = index + 1;

        if (
          next < tracks.length &&
          items[next].textContent?.endsWith('— Waiting')
        ) {
          items[next].textContent =
            `${tracks[next].name} — Processing`;
        }
      })
    );

    const results = await Promise.allSettled(promises);

    if (isClosing) return;

    let successCount = 0;
    let failedCount = 0;

    // Preserve original FIFO order for playback selection.
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;

        const trackIndex = decodedTracks.length;

        decodedTracks.push({
          name: tracks[index].name,
          buffer: result.value,
        });

        const button = createButton('Play');
        button.dataset.trackIndex = String(trackIndex);

        button.addEventListener('click', () => {
          void playTrack(trackIndex);
        });

        items[index].append(button);
        trackButtons.push(button);
      } else {
        failedCount++;
      }
    });

    status.textContent =
      `Completed: ${successCount} successful, ` +
      `${failedCount} failed/cancelled`;
  } catch (error: unknown) {
    if (!isClosing) {
      status.textContent =
        `Error: ${errorMessage(error)}`;
    }
  } finally {
    // Release temporary object URLs.
    for (const track of tracks) {
      if (track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
      }
    }

    isProcessing = false;
    updateButtons();
  }

  // Automatically play the first successful track.
  if (!isClosing && decodedTracks.length > 0) {
    await playTrack(0);
  }
}

// File selection
fileInput.addEventListener('change', () => {
  const count = fileInput.files?.length ?? 0;

  status.textContent = count > 0
    ? `${count} file(s) selected — Ready to process`
    : 'Ready — Select audio files to begin';

  updateButtons();
});

// Process selected files
processButton.addEventListener('click', () => {
  if (isProcessing || isClosing || isSwitching) return;

  const files = Array.from(fileInput.files ?? []);

  if (files.length === 0) return;

  const tracks = files.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file),
  }));

  void processTracks(tracks);
});

// Run original FIFO demo

demoButton.addEventListener('click', () => {
  if (isProcessing || isClosing || isSwitching) return;

  const firstFile = fileInput.files?.[0];

  if (!firstFile) {
    status.textContent = 'Please upload an audio file first.';
    return;
  }

  void processTracks([
    {
      name: `${firstFile.name} - Track 1`,
      url: URL.createObjectURL(firstFile),
    },
    {
      name: 'Track 2 - Invalid File',
      url: '/not-found.mp3',
    },
    {
      name: `${firstFile.name} - Track 3`,
      url: URL.createObjectURL(firstFile),
    },
  ]);
});


// Cancel active and queued tasks
cancelButton.addEventListener('click', () => {
  queue.cancelAll();
  status.textContent = 'Cancelling audio tasks...';
});

// Play selected track again
playButton.addEventListener('click', () => {
  const index = currentTrackIndex ?? 0;
  void playTrack(index);
});

// Stop playback
stopButton.addEventListener('click', () => {
  if (isSwitching) return;

  stopPlayback();
  currentTrackIndex = null;

  nowPlaying.textContent = 'Now Playing: None';
  status.textContent = 'Playback stopped';

  trackButtons.forEach(button => {
    button.textContent = 'Play';
  });

  updateButtons();
});

// FFT settings
fftSelect.addEventListener('change', () => {
  const size = Number(fftSelect.value);

  if (size !== 256 && size !== 512) return;

  engine.setFFTSize(size);

  status.textContent =
    `FFT ${size}: ${engine.getFrequencyData().length} bins`;
});

// Cleanup
window.addEventListener('pagehide', () => {
  isClosing = true;

  queue.cancelAll();
  stopPlayback();

  decodedTracks = [];
  currentTrackIndex = null;
  trackButtons.length = 0;

  void engine.close();
});

updateButtons();
