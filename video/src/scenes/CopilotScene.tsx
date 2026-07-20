import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {CallWorkspace} from '../components/OperatorUI';
import {RevealText} from '../components/Typography';
import {sceneOpacity} from '../utils/motion';
import {SCENES} from '../utils/timing';
export const CopilotScene:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'radial-gradient(circle at 50% 34%,#082044,#02050a 68%)',opacity:sceneOpacity(f,SCENES.copilot.duration,6),overflow:'hidden'}}><div style={{position:'absolute',left:45,top:95,transform:`perspective(1300px) rotateX(2deg) translateY(${Math.sin(f*.025)*5}px)`}}><CallWorkspace frame={f}/></div><div style={{position:'absolute',left:48,right:30,bottom:75}}><RevealText frame={f} start={82} style={{fontSize:38,fontWeight:700}}>AI помогает<br/>во время разговора.</RevealText></div></AbsoluteFill>};
