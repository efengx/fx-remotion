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
import { ClipVideoProps, ForegroundAnimation, BackgroundAnimation } from "./MyImage.loader";
import {
  TransitionOverlay,
} from "./FxAnimated/TransitionOverlay";
import { getResolution } from './node/Utils'
import { random } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Raleway';

const { fontFamily } = loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

const TRANSITION_DURATION_SECONDS = 0.5;

export const MyImage: React.FC<ClipVideoProps> = (props) => {
  const { fps } = useVideoConfig();
  const {
    processedScenes,                                // 这是从 loader 传递过来的
    totalCompositionDurationFrames,
  } = props;

  const transitionDurationFrames = Math.round(
    TRANSITION_DURATION_SECONDS * fps,
  );
  const slideInAnimationDurationFrames = Math.round(0.5 * fps);

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
      // style={{ backgroundColor: props.globalBackgroundColor }}
    >
      {processedScenes.map((scene, index) => {
        const audioDuration = scene.audioDurationInFrames;
        
        // 声音的起始帧
        const audioSequenceFrom = currentSequenceStartFrame;
        // 声音的结束帧
        const audioSequenceDuration = audioDuration;

        // 是否是最后的场景
        const isLastScene = index === processedScenes.length - 1;
        // 当前 Sequence 的起始帧
        const imageSequenceFrom = currentSequenceStartFrame;
        // 当前 Sequence 的结束帧
        const imageSequenceDuration = isLastScene
          ? totalCompositionDurationFrames - imageSequenceFrom
          : audioDuration + transitionDurationFrames;

        // 转场的起始帧
        const transitionSequenceFrom =
          currentSequenceStartFrame + audioDuration;
        // 转场的结束帧
        const transitionSequenceDuration = transitionDurationFrames;

        currentSequenceStartFrame += audioDuration;
        
        return (
          <React.Fragment key={scene.key}>
            <Sequence
              key={`images-${index}`}
              from={imageSequenceFrom}
              durationInFrames={imageSequenceDuration}
            >
              {scene.images.map(image => {
                let direction = "1:1";
                let randomAnimation = props.slideInDirection;
                if (image.transpart === 0) {
                  direction = props.direction;
                  if (props.direction === "9:16") {
                    randomAnimation = ForegroundAnimation[Math.floor(random(image.imagePath) * BackgroundAnimation.length)];
                  } else {
                    randomAnimation = BackgroundAnimation[Math.floor(random(image.imagePath) * ForegroundAnimation.length)];
                  }
                } else {
                  if (props.direction === "9:16") {
                    randomAnimation = BackgroundAnimation[Math.floor(random(image.imagePath) * ForegroundAnimation.length)];
                  } else {
                    randomAnimation = ForegroundAnimation[Math.floor(random(image.imagePath) * BackgroundAnimation.length)];
                  }
                }
                const { width, height} = getResolution(direction);
                return (
                  <AnimatedImage
                    key={image.imagePath}
                    src={image.imagePath}
                    image={image}
                    imageTargetWidth={width}                                   // 图像目标宽度
                    imageTargetHeight={height}                                 // 图像目标高度
                    slideInDirection={randomAnimation}                                         // 滑动方向
                    scalingBase={image.transpart === 0 ? 1 : 0.7}
                    audioDurationInFrames={audioDuration}                                       // 音频时长(帧数)
                    sequenceDurationFrames={imageSequenceDuration}                              // 图像序列持续时间
                    animationInDurationFrames={slideInAnimationDurationFrames}                  // 滑入动画持续时长(帧数)     
                    isLastScene={isLastScene}                                                   // 是否是最后的场景
                    totalCompositionDurationFrames={totalCompositionDurationFrames}             // 总构图持续时长(帧数)
                    zoomIntensity={props.zoomIntensity}                                         // 缩放强度
                    panIntensity={props.panIntensity}                                           // 缩放距离
                  />
                )
              })}
            </Sequence>

            {!isLastScene && processedScenes[index + 1] && (
              <Sequence
                key={`transition-${scene.key}`}
                from={transitionSequenceFrom}
                durationInFrames={transitionSequenceDuration}
              >
                {/* TransitionOverlay 负责渲染具体的转场效果 */}
                <TransitionOverlay
                  transitionType={scene.transitionType || "fade"}                                                   // 使用 loader 提供的转场类型，或默认为 fade
                  imageSrc1={scene.images.filter(image => image.transpart === 0)[0].imagePath}                      // 前一个图片（Outgoing）
                  imageSrc2={processedScenes[index + 1].images.filter(image => !image.transpart)[0].imagePath}      // 后一个图片（Incoming）
                  durationInFrames={transitionSequenceDuration}                                                     // 转场时长
                />
              </Sequence>
            )}

            <Sequence
              key={scene.key}
              from={audioSequenceFrom}
              durationInFrames={audioSequenceDuration}
            >
              <Audio src={staticFile(scene.audioSrcPath)} />
              {/* 卡拉ok字幕 + 高亮显示 */}
              {scene.wordTimings && scene.wordTimings.length > 0 ? (
                <SubtitlesDisplay
                  wordTimings={scene.wordTimings}
                  style={{ 
                    fontFamily,
                    fontSize: "50px",
                    color: 'rgb(255, 234, 5)'
                  }}
                />
              ) : null}
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
