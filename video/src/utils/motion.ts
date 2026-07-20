import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timing';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const reveal = (frame: number, start = 0, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

export const settle = (frame: number, delay = 0, damping = 18) =>
  spring({frame: frame - delay, fps: FPS, config: {damping, stiffness: 110, mass: 0.8}});

export const sceneOpacity = (frame: number, duration: number, edge = 10) =>
  interpolate(frame, [0, edge, duration - edge, duration], [0, 1, 1, 0], clamp);
