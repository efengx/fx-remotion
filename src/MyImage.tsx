
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  staticFile,
  Audio,
} from "remotion";
import { SubtitlesDisplay } from './FxAnimated/SubtitlesDisplay';
import { AnimatedImage, SlideDirection } from "./FxAnimated/AnimatedImage";
import { MyImageProps } from './MyImage.loader';


export const MyImage: React.FC<MyImageProps> = (props) => {
  const { fps } = useVideoConfig();
  const {
    imageTargetWidth,
    imageTargetHeight,
    processedScenes,                                      // 这是从 loader 传递过来的
    gapBetweenImagesFrames = Math.round(0.1 * fps),       // 如果 loader 没提供，给个默认值
  } = props;
  
  const slideInAnimationDurationFrames = 0.5 * fps;
  const slideOutAnimationDurationFrames = 0.5 * fps;
  const globalBackgroundColor = "#FFFFFF";
  // "left" | "right" | "top" | "bottom" | "kenBurnsRight" | "kenBurnsLeft" | "zoomIn" | "zoomOut";
  const slideInDirection: SlideDirection = "zoomIn";
  
  if (!processedScenes || processedScenes.length === 0) {
    return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: globalBackgroundColor }}><p>No scenes to display.</p></AbsoluteFill>;
  }

  let currentSequenceStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: globalBackgroundColor }}>
      {processedScenes.map((scene) => {
        // sequenceDuration 现在直接来自 scene.audioDurationInFrames
        const sequenceDuration = scene.audioDurationInFrames;
        const sequenceFrom = currentSequenceStartFrame;
        // gapBetweenImagesFrames 也是从 props (由 loader 计算) 获取的
        currentSequenceStartFrame += sequenceDuration + gapBetweenImagesFrames;

        return (
          <Sequence
            key={scene.key}
            from={sequenceFrom}
            durationInFrames={sequenceDuration}
          >
            <Audio src={staticFile(scene.audioSrcPath)} />
            <AnimatedImage
              src={scene.imageSrc}
              imageTargetWidth={imageTargetWidth}
              imageTargetHeight={imageTargetHeight}
              slideInDirection={slideInDirection}
              activeDurationInFrames={sequenceDuration}
              animationInDurationFrames={slideInAnimationDurationFrames}
              animationOutDurationFrames={slideOutAnimationDurationFrames}
            />
            {scene.captions.length > 0 ? (
              <SubtitlesDisplay 
                captions={scene.captions} 
                style={{ fontSize: '24px' }} 
              />
            ) : (
              null
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
