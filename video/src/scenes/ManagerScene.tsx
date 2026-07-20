import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {ManagerDashboard} from '../components/QualityUI';
import {RevealText} from '../components/Typography';
import {sceneOpacity} from '../utils/motion';
import {COLORS,SCENES} from '../utils/timing';
export const ManagerScene:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'radial-gradient(circle at 70% 40%,#092044,#02050a 72%)',opacity:sceneOpacity(f,SCENES.manager.duration,6)}}><div style={{position:'absolute',left:40,top:88,transform:'perspective(1200px) rotateY(-2deg)'}}><ManagerDashboard frame={f}/></div><div style={{position:'absolute',left:48,bottom:60,right:30}}><RevealText frame={f} start={50} style={{fontSize:39,fontWeight:700}}>Каждый звонок измерим.</RevealText><RevealText frame={f} start={66} style={{fontSize:39,fontWeight:700,color:COLORS.cyan}}>Каждый результат управляем.</RevealText></div></AbsoluteFill>};
