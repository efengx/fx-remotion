import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  staticFile,
  Audio,
  Img,
} from "remotion";
import { SubtitlesDisplay } from "./FxAnimated/SubtitlesDisplay";
import { AnimatedImage } from "./FxAnimated/AnimatedImage";
import { ClipVideoProps, KenBurnsAnimation, StandardAnimation } from "./MyImage.loader";
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

const baseAreaStyle: React.CSSProperties = {
  position: 'absolute',
  overflow: 'hidden', // 确保滑入动画不会超出区域边界
  display: 'flex',    // 用于内部 AnimatedImage 的对齐（如果需要）
  justifyContent: 'center',
  alignItems: 'center',
};

const getAreaStyles = (direction: string, index: number) => {
  switch (`${direction}-${index}`) {
    case "9:16-3":
      return {
        ...baseAreaStyle,
        top: '16%', 
        left: '5%',
        width: '384px', 
        height: '384px', 
        // boxShadow: `inset 0 0 0 2px red`,
      }
    case "9:16-4":
      return {
        ...baseAreaStyle,
        top: '57%', 
        right: '5%', // 使用 right 定位
        width: '384px',
        height: '384px',
        // boxShadow: `inset 0 0 0 2px red`,
      }
    case "16:9-3":
      return {
        ...baseAreaStyle,
        top: '15%', 
        left: '10%',
        width: '500px', 
        height: '500px', 
        // boxShadow: `inset 0 0 0 2px red`,
      }
    case "16:9-4":
      return {
        ...baseAreaStyle,
        top: '15%', 
        right: '10%', // 使用 right 定位
        width: '500px',
        height: '500px',
        // boxShadow: `inset 0 0 0 2px red`,
      }
    default:
      return {}
  }
}

const getSubtitlesStyles = (direction: string) => {
  console.log("===direction,", direction);
  switch (direction) {
    case "9:16":
      return {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }
    case "16:9":
      return {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
      }
    default:
      return {}
  }
}

export const MyImage: React.FC<ClipVideoProps> = (props) => {
  const { fps } = useVideoConfig();
  const {
    processedScenes,                                // 这是从 loader 传递过来的
    thumbnailImage,
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

  let currentSequenceStartFrame = 1;
  const direction = props.direction;
  return (
    <AbsoluteFill
      // style={{ backgroundColor: props.globalBackgroundColor }}
    >
      {/* 添加首帧的开场图片 */}
      {thumbnailImage.length > 0 ? (
        <Sequence durationInFrames={slideInAnimationDurationFrames} >
          <Img
            src={staticFile(thumbnailImage)} // Use staticFile to ensure Remotion finds local public assets
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </Sequence>
      ) : null }

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
        // 当前 Sequence 的结束帧, 也就是从0开始的动画持续帧数(通常是音频时长+转场时长, 结束帧没有转场时长)
        const imageSequenceDuration = isLastScene
          ? totalCompositionDurationFrames - imageSequenceFrom
          : audioDuration + transitionDurationFrames;

        // 转场的起始帧
        const transitionSequenceFrom = currentSequenceStartFrame + audioDuration;
        // 转场的结束帧
        const transitionSequenceDuration = transitionDurationFrames;
        
        const foregroundImage = scene.images.filter(image => image.transpart === 1);
        
        // 当前场景下每张图片的平均帧数
        const pairSequenceDuration = Math.ceil(imageSequenceDuration / foregroundImage.length);
        let currentPairSequenceFrom = 1;

        // 更新下一场的起始帧
        currentSequenceStartFrame += audioDuration;
        return (
          <React.Fragment key={scene.key}>
            <Sequence
              key={`images-${index}`}
              from={imageSequenceFrom}
              durationInFrames={imageSequenceDuration}
            >
              {/* 1. 渲染背景图片 */}
              {scene.images.filter(image => image.transpart === 0).map(image => {
                let randomAnimation = props.slideInDirection;
                
                if (direction === "9:16") {
                  randomAnimation = KenBurnsAnimation[Math.floor(random(image.imagePath) * KenBurnsAnimation.length)];
                } else {
                  randomAnimation = StandardAnimation[Math.floor(random(image.imagePath) * StandardAnimation.length)];
                }

                const { width, height} = getResolution(direction);
                return (
                  <AnimatedImage
                    key={image.imagePath}
                    src={image.imagePath}
                    image={image}
                    imageTargetWidth={width}                                   // 图像目标宽度
                    imageTargetHeight={height}                                 // 图像目标高度
                    slideInDirection={randomAnimation}                                          // 滑动方向
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

              {/* 2. 渲染前景图片 */}
              {scene.images.filter(image => image.transpart === 1).map((image, index) => {
                const direction = props.direction;
                let randomAnimation0 = props.slideInDirection;
                // let randomAnimation1 = props.slideInDirection;
                if (direction === "9:16") {
                  randomAnimation0 = StandardAnimation[Math.floor(random(image.imagePath) * StandardAnimation.length)];
                } else {
                  randomAnimation0 = KenBurnsAnimation[Math.floor(random(image.imagePath) * KenBurnsAnimation.length)];
                }

                const { width, height} = getResolution("1:1");

                const pairSequenceFrom = currentPairSequenceFrom;

                // 下一个循环的起始帧
                currentPairSequenceFrom += pairSequenceDuration;
                return (
                  <Sequence
                    key={`fg-pair-${image.imagePath}`}
                    from={pairSequenceFrom}
                    // 当前这对图片实际的动画持续时间，应为其轮播时段的长度。
                    // AnimatedImage 内部的 sequenceDurationFrames 也应与此匹配，以确保动画（如Ken Burns）在正确的时段内完成。
                    durationInFrames={pairSequenceDuration * 2} 
                  >
                    <div
                      key={index + "-" + image.imagePath}
                      style={index % 2 === 1 ? getAreaStyles(direction, 4) : getAreaStyles(direction, 3)}
                    >
                      <AnimatedImage
                        key={image.imagePath}
                        src={image.imagePath}
                        image={image}
                        imageTargetWidth={width}                                   // 图像目标宽度
                        imageTargetHeight={height}                                 // 图像目标高度
                        slideInDirection={randomAnimation0}                                          // 滑动方向
                        scalingBase={0.7}
                        audioDurationInFrames={audioDuration}                                       // 音频时长(帧数)
                        sequenceDurationFrames={imageSequenceDuration}                              // 图像序列持续时间
                        animationInDurationFrames={slideInAnimationDurationFrames}                  // 滑入动画持续时长(帧数)     
                        isLastScene={isLastScene}                                                   // 是否是最后的场景
                        totalCompositionDurationFrames={totalCompositionDurationFrames}             // 总构图持续时长(帧数)
                        zoomIntensity={props.zoomIntensity}                                         // 缩放强度
                        panIntensity={props.panIntensity}                                           // 缩放距离
                      />
                    </div>
                  </Sequence>
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
              {/* 语音旁白 */}
              <Audio src={staticFile(scene.audioSrcPath)} />
              {/* 卡拉ok字幕 + 高亮显示 */}
              {scene.wordTimings && scene.wordTimings.length > 0 ? (
                <SubtitlesDisplay
                  sceneIndex={index}
                  wordTimings={scene.wordTimings}
                  wordParentStyle={getSubtitlesStyles(direction)}
                  style={{ 
                    fontFamily,
                    fontSize: "50px",
                    // color: 'rgb(255, 234, 5)',
                    // WebkitTextStroke: "1px #2C2C2C",
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
