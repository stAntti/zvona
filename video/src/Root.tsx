import {Composition} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './utils/timing';
import {ZvonaLaunch, type ZvonaLaunchProps} from './ZvonaLaunch';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ZvonaLaunch"
    component={ZvonaLaunch}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{audioEnabled: true} satisfies ZvonaLaunchProps}
  />
);
