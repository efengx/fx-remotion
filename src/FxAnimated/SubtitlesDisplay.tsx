import { Sequence, useVideoConfig, AbsoluteFill } from 'remotion';
import { Caption } from '@remotion/captions';


interface SubtitlesProps {
  captions: Caption[];                // SRT 文件在 public 目录下的路径
  style?: React.CSSProperties;
}

const defaultStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '24px',                             // 根据视频尺寸调整
  // fontWeight: 'bold',
  textAlign: 'center',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',      // 半透明背景
  padding: '10px 20px',
  borderRadius: '5px',
  position: 'absolute',
  bottom: '10%',                                // 距离底部10%
  left: '50%',
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