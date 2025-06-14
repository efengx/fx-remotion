import { Sequence, useVideoConfig, AbsoluteFill } from 'remotion';
import { Caption } from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/Raleway';

const { fontFamily } = loadFont();

interface SubtitlesProps {
  captions: Caption[];                // SRT 文件在 public 目录下的路径
  style?: React.CSSProperties;
}

const defaultStyle: React.CSSProperties = {
  // fontFamily: 'Raleway, Arial, Helvetica, sans-serif',
  fontFamily,
  fontSize: '24px',                             // 根据视频尺寸调整
  // fontWeight: 'bold',
  textAlign: 'center',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',      // 半透明背景
  padding: '5px 5px',
  borderRadius: '5px',
  position: 'absolute',
  bottom: '3%',                                 // 距离底部3%
  left: '50%',
  width: '94%',
  transform: 'translateX(-50%)',
  whiteSpace: 'pre-wrap',                       // 保留换行符
};

export const SubtitlesDisplay: React.FC<SubtitlesProps> = ({ captions, style }) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {captions.map((sub, index) => {
        const startFrame = Math.floor((sub.startMs / 1000) * fps);
        const endFrame = Math.floor((sub.endMs / 1000) * fps);
        const durationInFrames = endFrame - startFrame;

        if (durationInFrames <= 0) return null; // 忽略无效时长的字幕

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
              <div style={{ ...defaultStyle, ...style }}>
                {sub.text}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};