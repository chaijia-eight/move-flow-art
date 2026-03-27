// Chess sound effects using Web Audio API — warm, rich, non-pixelated
import { isSoundEnabled } from "@/lib/settingsStore";

const SOUND_URLS = {
  move: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3",
  capture: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3",
  castle: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3",
  gameEnd: "https://images.chesscomfiles.com/chess-themes/sounds/_WEBM_/default/game-end.webm",
};

const audioCache: Record<string, HTMLAudioElement> = {};

function preload(key: keyof typeof SOUND_URLS) {
  if (!audioCache[key]) {
    audioCache[key] = new Audio(SOUND_URLS[key]);
  }
}

// Preload all sounds
Object.keys(SOUND_URLS).forEach((k) => preload(k as keyof typeof SOUND_URLS));

function playSound(key: keyof typeof SOUND_URLS) {
  if (!isSoundEnabled()) return;
  const audio = audioCache[key];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

export function playMoveSound() {
  playSound("move");
}

export function playCaptureSound() {
  playSound("capture");
}

export function playCastleSound() {
  playSound("castle");
}

// Keep these as simple wrappers using move sound
export function playMasterySound() {
  playSound("move");
}

export function playLineCompleteSound() {
  playSound("move");
}
