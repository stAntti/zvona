import type {CSSProperties, ReactNode} from 'react';
import {COLORS, FONT} from '../utils/timing';

export const Panel: React.FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => <div style={{padding: 7, borderRadius: 26, background: 'rgba(84,143,207,.08)', boxShadow: 'inset 0 0 0 1px rgba(139,196,255,.12)', ...style}}><div style={{height: '100%', boxSizing: 'border-box', borderRadius: 20, background: COLORS.panel, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 30px 80px rgba(0,18,45,.3)', overflow: 'hidden'}}>{children}</div></div>;

export const Label: React.FC<{children: ReactNode; tone?: 'blue'|'muted'}> = ({children, tone='muted'}) => <span style={{fontFamily: FONT, color: tone==='blue'?COLORS.cyan:COLORS.muted, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase'}}>{children}</span>;

export const Hairline: React.FC = () => <div style={{height: 1, background: 'linear-gradient(90deg,transparent,rgba(108,185,255,.25),transparent)'}}/>;
