import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CompanyContext, CompanyQueue} from '../components/OperatorUI';
import {RevealText} from '../components/Typography';
import {sceneOpacity} from '../utils/motion';
import {COLORS, SCENES} from '../utils/timing';
export const PrepareScene:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'radial-gradient(circle at 55% 42%,#09244a 0,#02050a 62%)',opacity:sceneOpacity(f,SCENES.prepare.duration,6)}}><div style={{position:'absolute',left:38,top:120,display:'flex',gap:14,transform:'perspective(1100px) rotateX(3deg)'}}><CompanyQueue frame={f}/><CompanyContext frame={f}/></div><div style={{position:'absolute',left:48,right:45,bottom:85}}><RevealText frame={f} start={50} style={{fontSize:20,fontWeight:550,color:COLORS.cyan}}>Контекст подготовлен</RevealText><RevealText frame={f} start={59} style={{fontSize:40,fontWeight:680,lineHeight:1.08}}>Оператор знает,<br/>кому и зачем звонит.</RevealText></div></AbsoluteFill>};
