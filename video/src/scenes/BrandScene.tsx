import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EnergyField} from '../components/EnergyField';
import {RevealText} from '../components/Typography';
import {clamp, sceneOpacity} from '../utils/motion';
import {COLORS, FONT, SCENES} from '../utils/timing';

export const BrandScene: React.FC = () => {const f=useCurrentFrame();const flash=interpolate(f,[62,72,75],[0,.9,0],clamp);return <AbsoluteFill style={{opacity:sceneOpacity(f,SCENES.brand.duration,7),background:COLORS.black}}><EnergyField intensity={1.15} speed={.8} focusX={48} focusY={57}/><AbsoluteFill style={{display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}}><div><RevealText frame={f} start={10} style={{fontSize:104,fontWeight:760,lineHeight:1}}>ZVONA</RevealText><RevealText frame={f} start={28} style={{fontSize:23,fontWeight:500,color:'#c8d4e6',letterSpacing:'.01em',marginTop:18}}>Люди звонят. <span style={{color:COLORS.cyan}}>AI ведёт.</span></RevealText></div></AbsoluteFill><AbsoluteFill style={{background:`rgba(101,199,255,${flash})`,mixBlendMode:'screen'}}/><div style={{position:'absolute',bottom:50,left:0,right:0,textAlign:'center',fontFamily:FONT,color:COLORS.muted,fontSize:11,letterSpacing:'.18em'}}>AI SALES OPERATING SYSTEM</div></AbsoluteFill>};
