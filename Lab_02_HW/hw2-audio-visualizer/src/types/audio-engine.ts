
export type FFTSize = 256 | 512;

export interface AudioEngineConfig {
  fftSize: FFTSize;
}

export interface AudioEngineNodes {
  context: AudioContext;
  analyser: AnalyserNode;
}
