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

export type SlideDirection = "left" | "right" | "top" | "bottom" | "kenBurnsRight" | "kenBurnsLeft" | "zoomIn" | "zoomOut" | "none";

interface AnimatedImageProps {
  src: string;
  slideInDirection: SlideDirection;
  imageTargetWidth: number;
  imageTargetHeight: number;
  activeDurationInFrames: number;       // Total duration this image is visible (matches audio)
  animationInDurationFrames: number;    // Duration of the slide-in/fade-in effect
  animationOutDurationFrames: number;   // Duration of the fade-out effect
}

export const AnimatedImage: React.FC<AnimatedImageProps> = (props) => {
  const frame = useCurrentFrame();              // Frame relative to the parent Sequence
  const { 
    // durationInFrames: parentSequenceDuration,   // 总帧数
    fps,                                        // 
    width: screenWidth, 
    height: screenHeight 
  } = useVideoConfig();
  const {
    src,
    slideInDirection,
    imageTargetWidth,
    imageTargetHeight,
    activeDurationInFrames,
    animationInDurationFrames,
    animationOutDurationFrames,
  } = props;

  const safeAnimationInDuration = Math.min(animationInDurationFrames, activeDurationInFrames / 2);
  const safeAnimationOutDuration = Math.min(animationOutDurationFrames, activeDurationInFrames / 2);

  // --- 特效参数 ---
  let scale = 1;
  let initialTranslateX = 0;
  let initialTranslateY = 0;
  const targetX = 0;                // Centered
  const targetY = 0;                // Centered

  // Ken Burns Effect (缓慢缩放和平移)
  const zoomIntensity = 0.15;       // 缩放幅度 (15%)
  const panIntensity = 50;          // 平移幅度 (像素)
  
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
      scale = interpolate(frame, [0, activeDurationInFrames], [1, 1 + zoomIntensity]);
      initialTranslateX = interpolate(frame, [0, activeDurationInFrames], [-panIntensity / 2, panIntensity / 2]);
      initialTranslateY = interpolate(frame, [0, activeDurationInFrames], [10, -10]);                  // 轻微上下移动
      break;
    case 'kenBurnsLeft':                                                                  // 从右到左缓慢移动，并轻微放大
      scale = interpolate(frame, [0, activeDurationInFrames], [1, 1 + zoomIntensity]);
      initialTranslateX = interpolate(frame, [0, activeDurationInFrames], [panIntensity / 2, -panIntensity / 2]);
      initialTranslateY = interpolate(frame, [0, activeDurationInFrames], [-10, 10]);
      break;
    case 'zoomIn':                                                                        // 缓慢放大
      scale = interpolate(frame, [0, activeDurationInFrames], [1, 1 + zoomIntensity * 1.5], {
        easing: Easing.bezier(0.5, 0, 0.5, 1),                                            // 平滑的缓动
      });
      break;
    case 'zoomOut':                                                                       // 缓慢缩小 (确保图片足够大)
      scale = interpolate(frame, [0, activeDurationInFrames], [1 + zoomIntensity * 1.5, 1], {
        easing: Easing.bezier(0.5, 0, 0.5, 1),
      });
      break;
    case "none": // No slide/pan/zoom effect, only fade (if not overridden)
      default:
        break;
  }

  let currentXPosition = initialTranslateX;
  let currentYPosition = initialTranslateY;

  const isSlideEffect = ["left", "right", "top", "bottom"].includes(slideInDirection);
  if (isSlideEffect) {
    // 滑入弹簧效果（仅适用于“左”、“右”、“上”、“下”）
    const springConfig = { stiffness: 100, damping: 20, mass: 1 };
    const progressForSpring = spring({
      frame,
      fps,
      config: springConfig,
      durationInFrames: safeAnimationInDuration, 
    });
    currentXPosition = interpolate(progressForSpring, [0, 1], [initialTranslateX, targetX]);
    currentYPosition = interpolate(progressForSpring, [0, 1], [initialTranslateY, targetY]);
  } else if (slideInDirection === 'kenBurnsLeft' || slideInDirection === 'kenBurnsRight') {
    // 对于 Ken Burns 来说，当前位置直接来自已经插入的 initialTranslateX/Y
    currentXPosition = initialTranslateX;
    currentYPosition = initialTranslateY;
  } else {
    // 对于放大、缩小、无或禁用动画
    currentXPosition = targetX;
    currentYPosition = targetY;
  }
  
  // 内部淡入/淡出逻辑
  const opacity = interpolate(
    frame,
    [
      0,
      safeAnimationInDuration,
      Math.max(safeAnimationInDuration, activeDurationInFrames - safeAnimationOutDuration), // 确保终点不在起点之前
      activeDurationInFrames,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (opacity === 0 && frame >= activeDurationInFrames) {
    return null;
  }

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: imageTargetWidth,
          opacity: opacity,
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${currentXPosition}px) translateY(${currentYPosition}px)`,
        }}
      >
        <Img
          src={staticFile(src)}                               // Use staticFile to ensure Remotion finds local public assets
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
