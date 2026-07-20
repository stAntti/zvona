export const FPS = 30;
export const WIDTH = 720;
export const HEIGHT = 1280;
export const TOTAL_FRAMES = 630;

export const SCENES = {
  brand: {from: 0, duration: 75},
  problem: {from: 75, duration: 75},
  prepare: {from: 150, duration: 90},
  copilot: {from: 240, duration: 120},
  quality: {from: 360, duration: 90},
  manager: {from: 450, duration: 90},
  finale: {from: 540, duration: 90},
} as const;

export const COLORS = {
  black: '#02050a',
  navy: '#061326',
  blue: '#148cff',
  cyan: '#65c7ff',
  white: '#f4f8ff',
  muted: '#8190a6',
  line: 'rgba(124,183,255,.16)',
  panel: 'rgba(5,17,33,.86)',
  success: '#6ce6bd',
} as const;

export const FONT = "Geist, 'Aptos Display', 'Segoe UI Variable Display', sans-serif";
