import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../utils/timing';

type Props = {intensity?: number; speed?: number; focusX?: number; focusY?: number; blur?: number; opacity?: number};

export const EnergyField: React.FC<Props> = ({intensity = 1, speed = 1, focusX = 52, focusY = 45, blur = 18, opacity = 1}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.018 * speed) * 22;
  const breathe = interpolate(Math.sin(frame * 0.025 * speed), [-1, 1], [0.82, 1.12]);
  return <AbsoluteFill style={{overflow: 'hidden', opacity, background: COLORS.black}}>
    <svg width="100%" height="100%" viewBox="0 0 720 1280" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, transform: `scale(${1.08 * breathe}) translate3d(${drift}px,${-drift * .35}px,0)`}}>
      <defs>
        <filter id="energy" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency=".007 .018" numOctaves="3" seed="17" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={52 * intensity} xChannelSelector="R" yChannelSelector="B"/>
          <feGaussianBlur stdDeviation={blur}/>
        </filter>
        <radialGradient id="core" cx={`${focusX}%`} cy={`${focusY}%`} r="65%">
          <stop offset="0" stopColor={COLORS.cyan} stopOpacity={.8 * intensity}/>
          <stop offset=".28" stopColor={COLORS.blue} stopOpacity={.48 * intensity}/>
          <stop offset=".7" stopColor="#06152f" stopOpacity=".16"/>
          <stop offset="1" stopColor="#010308" stopOpacity="0"/>
        </radialGradient>
        <pattern id="mesh" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11 Q5 4 11 11 T22 11" fill="none" stroke="#65c7ff" strokeOpacity=".14" strokeWidth=".7"/>
        </pattern>
      </defs>
      <path d="M-90 840 C100 510 248 772 410 492 C532 282 770 330 826 1008 L820 1370 L-80 1370Z" fill="url(#core)" filter="url(#energy)"/>
      <path d="M-80 900 C140 620 288 815 430 570 C560 350 760 420 800 1050" fill="none" stroke="#4bb5ff" strokeOpacity={.5 * intensity} strokeWidth="3" filter="url(#energy)"/>
      <rect width="100%" height="100%" fill="url(#mesh)" opacity={.35 * intensity}/>
    </svg>
    <AbsoluteFill style={{background: `radial-gradient(circle at ${focusX}% ${focusY}%, transparent 0%, rgba(2,5,10,.18) 45%, #02050a 82%)`}}/>
  </AbsoluteFill>;
};
