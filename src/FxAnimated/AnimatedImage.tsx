import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
  Easing,
} from "remotion";

interface AnimatedImageProps {
  src: string;
  slideInDirection: string;
  imageTargetWidth: number;             // 图片渲染的目标宽度
  imageTargetHeight: number;            // 图片渲染的目标高度
  audioDurationInFrames: number;        // Total duration this image is visible (matches audio)
  sequenceDurationFrames: number;
  animationInDurationFrames: number;    // Duration of the slide-in/fade-in effect
  // animationOutDurationFrames: number;   // Duration of the fade-out effect
  isLastScene: boolean;
  zoomIntensity: number;                // 缩放幅度 (15%)
  panIntensity: number;                // 平移幅度 (像素)
  totalCompositionDurationFrames: number;
}

export const AnimatedImage: React.FC<AnimatedImageProps> = (props) => {
  const frame = useCurrentFrame();              // Frame relative to the parent Sequence
  
  const {
    fps,                                        // 
    width: screenWidth, 
    height: screenHeight 
  } = useVideoConfig();
  const {
    src,
    slideInDirection,
    imageTargetWidth,
    imageTargetHeight,
    audioDurationInFrames,
    sequenceDurationFrames,
    animationInDurationFrames,
    zoomIntensity,
    panIntensity,
    isLastScene,
    totalCompositionDurationFrames,
  } = props;

  const safeAnimationInDuration = Math.min(animationInDurationFrames, sequenceDurationFrames);
  
  // --- 特效参数 ---
  let scale = 1;
  let initialTranslateX = 0;
  let initialTranslateY = 0;
  const targetX = 0;                // Centered
  const targetY = 0;                // Centered

  switch (slideInDirection) {
    case "left":
      initialTranslateX = -(screenWidth / 2 + imageTargetWidth / 2); // Start off-screen to the left
      break;
    case "right":
      initialTranslateX = screenWidth / 2 + imageTargetWidth / 2; // Start off-screen to the right
      break;
    case "top":
      initialTranslateY = -(screenHeight / 2 + (imageTargetHeight || screenHeight) / 2);         // Start off-screen above
      break;
    case "bottom":
      initialTranslateY = screenHeight / 2 + (imageTargetHeight || screenHeight) / 2;            // Start off-screen below
      break;
    case "kenBurnsRight":
      scale = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [1, 1 + zoomIntensity]
      );
      initialTranslateX = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [-panIntensity / 2, panIntensity / 2]
      );
      initialTranslateY = interpolate(
        frame,
        [0, audioDurationInFrames],
        [panIntensity / 10, -panIntensity / 10], // Smaller vertical pan
      );
      break;
    case 'kenBurnsLeft':                                                                  // 从右到左缓慢移动，并轻微放大
      scale = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [1, 1 + zoomIntensity]
      );
      initialTranslateX = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [panIntensity / 2, -panIntensity / 2]
      );
      initialTranslateY = interpolate(
        frame,
        [0, audioDurationInFrames],
        [-panIntensity / 10, panIntensity / 10], // Smaller vertical pan
      );
      break;
    case 'zoomIn':                                                                        // 缓慢放大
      scale = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [1, 1 + zoomIntensity * 1.5], 
        {
          easing: Easing.bezier(0.5, 0, 0.5, 1),                                            // 平滑的缓动
        }
      );
      break;
    case 'zoomOut':                                                                       // 缓慢缩小 (确保图片足够大)
      scale = interpolate(
        frame, 
        [0, audioDurationInFrames], 
        [1 + zoomIntensity * 1.5, 1], 
        {
          easing: Easing.bezier(0.5, 0, 0.5, 1),
        }
      );
      break;
    case "none":
    default:
      break;
  }

  let currentXPosition = initialTranslateX;
  let currentYPosition = initialTranslateY;

  const isSlideEffect = ["left", "right", "top", "bottom"].includes(
    slideInDirection
  );
  if (isSlideEffect) {
    // 滑入弹簧效果（仅适用于“左”、“右”、“上”、“下”）
    const springConfig = { stiffness: 100, damping: 20, mass: 1 };
    const progressForSpring = spring({
      frame,
      fps,
      config: springConfig,
      durationInFrames: safeAnimationInDuration, 
    });
    currentXPosition = interpolate(
      progressForSpring, 
      [0, 1], 
      [initialTranslateX, targetX]
    );
    currentYPosition = interpolate(
      progressForSpring, 
      [0, 1], 
      [initialTranslateY, targetY]
    );
  }
  
  const fadeInOpacity = interpolate(frame, [0, safeAnimationInDuration], [0, 1], { extrapolateRight: "clamp" });

  // Fade out ONLY for the last scene, and it fades out at the end of the ENTIRE composition
  // Need to map the last scene's sequence frame to absolute frame for correct timing
  const fadeOutOpacity = isLastScene
    ? interpolate(
        frame,
        [totalCompositionDurationFrames - (sequenceDurationFrames - audioDurationInFrames), totalCompositionDurationFrames], // Fade out during the last X frames of its sequence, timed to end at totalCompositionDurationFrames
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);


  if (opacity === 0 && frame >= sequenceDurationFrames) {
    return null;
  }

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: imageTargetWidth,
          height: imageTargetHeight,
          opacity: opacity,
          overflow: 'hidden',
          transform: `scale(${scale}) translateX(${currentXPosition}px) translateY(${currentYPosition}px)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Img
          src={staticFile(src)}                               // Use staticFile to ensure Remotion finds local public assets
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
