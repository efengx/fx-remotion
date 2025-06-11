import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  staticFile,
  Audio,
} from "remotion";
import { SubtitlesDisplay } from "./FxAnimated/SubtitlesDisplay";
import { AnimatedImage } from "./FxAnimated/AnimatedImage";
import { MyImageProps } from "./MyImage.loader";
import {
  TransitionOverlay,
} from "./FxAnimated/TransitionOverlay";

const TRANSITION_DURATION_SECONDS = 0.5;

export const MyImage: React.FC<MyImageProps> = (props) => {
  const { fps } = useVideoConfig();
  const {
    imageTargetWidth,
    imageTargetHeight,
    processedScenes, // 这是从 loader 传递过来的
    clipVideo,
    totalCompositionDurationFrames,
  } = props;

  const transitionDurationFrames = Math.round(
    TRANSITION_DURATION_SECONDS * fps,
  );
  const slideInAnimationDurationFrames = Math.round(0.5 * fps);

  // const slideOutAnimationDurationFrames = Math.round(0.5 * fps);
  // const globalBackgroundColor = "#FFFFFF";
  const slideInDirection = clipVideo.slideInDirection;

  if (!processedScenes || processedScenes.length === 0) {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <p>No scenes to display.</p>
      </AbsoluteFill>
    );
  }

  let currentSequenceStartFrame = 0;

  return (
    <AbsoluteFill
    // style={{ backgroundColor: globalBackgroundColor }}
    >
      {processedScenes.map((scene, index) => {
        const audioDuration = scene.audioDurationInFrames;
        const isLastScene = index === processedScenes.length - 1;

        const audioSequenceFrom = currentSequenceStartFrame;
        const audioSequenceDuration = audioDuration;

        const imageSequenceFrom = currentSequenceStartFrame;
        const imageSequenceDuration = isLastScene
          ? totalCompositionDurationFrames - imageSequenceFrom
          : audioDuration + transitionDurationFrames;

        const transitionSequenceFrom =
          currentSequenceStartFrame + audioDuration;
        const transitionSequenceDuration = transitionDurationFrames;

        // const sequenceDuration = isLastScene
        //   ? audioDuration
        //   : audioDuration + transitionDurationFrames;
        // const sequenceFrom = index === 0 ? 0 : currentSequenceStartFrame;
        currentSequenceStartFrame += audioDuration;

        return (
          <React.Fragment key={scene.key}>
            <Sequence
              from={imageSequenceFrom}
              durationInFrames={imageSequenceDuration}
            >
              <AnimatedImage
                src={scene.imageSrc}
                imageTargetWidth={imageTargetWidth}
                imageTargetHeight={imageTargetHeight}
                slideInDirection={slideInDirection}
                audioDurationInFrames={audioDuration}
                sequenceDurationFrames={imageSequenceDuration}
                animationInDurationFrames={slideInAnimationDurationFrames}
                // animationOutDurationFrames={slideOutAnimationDurationFrames}
                isLastScene={isLastScene}
                totalCompositionDurationFrames={totalCompositionDurationFrames}
                zoomIntensity={clipVideo.zoomIntensity}
                panIntensity={clipVideo.panIntensity}
              />
            </Sequence>

            {!isLastScene && processedScenes[index + 1] && (
              <Sequence
                key={`transition-${scene.key}`}
                from={transitionSequenceFrom}
                durationInFrames={transitionSequenceDuration}
              >
                 {/* TransitionOverlay 负责渲染具体的转场效果 */}
                <TransitionOverlay
                  transitionType={scene.transitionType || "fade"} // 使用 loader 提供的转场类型，或默认为 fade
                  imageSrc1={scene.imageSrc} // 前一个图片（Outgoing）
                  imageSrc2={processedScenes[index + 1].imageSrc} // 后一个图片（Incoming）
                  durationInFrames={transitionSequenceDuration} // 转场时长
                />
              </Sequence>
            )}

            <Sequence
              key={scene.key}
              from={audioSequenceFrom}
              durationInFrames={audioSequenceDuration}
            >
              <Audio src={staticFile(scene.audioSrcPath)} />
              {scene.captions.length > 0 ? (
                <SubtitlesDisplay
                  captions={scene.captions}
                  style={{ fontSize: "24px" }}
                />
              ) : null}
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
