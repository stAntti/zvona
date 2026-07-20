import type {CSSProperties, ReactNode} from 'react';
import {interpolate} from 'remotion';
import {reveal} from '../utils/motion';
import {COLORS, FONT} from '../utils/timing';

export const RevealText: React.FC<{children: ReactNode; frame: number; start?: number; style?: CSSProperties}> = ({children, frame, start = 0, style}) => {
  const p = reveal(frame, start, 20);
  return <div style={{overflow: 'hidden', padding: '4px 0'}}><div style={{fontFamily: FONT, color: COLORS.white, transform: `translate3d(0,${(1-p)*70}px,0)`, filter: `blur(${(1-p)*14}px)`, opacity: p, letterSpacing: `${interpolate(p,[0,1],[.09,-.025])}em`, ...style}}>{children}</div></div>;
};

export const Eyebrow: React.FC<{children: ReactNode}> = ({children}) => <div style={{fontFamily: FONT, color: COLORS.cyan, fontSize: 14, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 650}}>{children}</div>;
