import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';
import { TransitionType } from '../MyImage.loader'; // 导入转场类型


interface TransitionOverlayProps {
  transitionType: TransitionType; // 转场类型
  imageSrc1: string; // 过渡前的图片 (Outgoing)
  imageSrc2: string; // 过渡后的图片 (Incoming)
  durationInFrames: number; // 转场 Sequence 的总时长
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  transitionType,
  imageSrc1,
  imageSrc2,
  durationInFrames,
}) => {
  const frame = useCurrentFrame(); // 当前帧 (相对于本 Sequence 的起始帧)
  const progress = frame / durationInFrames; // 转场进度 (0 到 1)


  // Base styles for images covering the full AbsoluteFill container
  const baseImageStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', // 或 'contain', 根据你的设计选择
    display: 'block',
  };

  // Styles for the outgoing (bottom) and incoming (top) images
  const styleImage1: React.CSSProperties = { ...baseImageStyle };
  const styleImage2: React.CSSProperties = { ...baseImageStyle };

  // Default is to show image1 fully, image2 hidden.
  // Transition logic reveals image2 over image1.
  styleImage1.opacity = 1;
  styleImage2.opacity = 0; // Initially hide image2 for many transitions


  switch (transitionType) {
    case 'fade':
      // image1 fades out, image2 fades in
      styleImage1.opacity = interpolate(progress, [0, 1], [1, 0]);
      styleImage2.opacity = interpolate(progress, [0, 1], [0, 1]);
      break;

    case 'wipeRight':
      // image2 is revealed from left to right using clipPath
      // image1 stays fully visible underneath
      styleImage1.opacity = 1; // Image 1 stays visible until wiped over
      styleImage2.opacity = 1; // Image 2 becomes visible as it's clipped
      styleImage2.clipPath = `inset(0px ${interpolate(progress, [0, 1], [100, 0])}% 0px 0px)`;
      break;

    case 'wipeLeft':
       // image2 is revealed from right to left using clipPath
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.clipPath = `inset(0px 0px 0px ${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;

    case 'slideRight':
       // image2 slides in from the right, covering image1
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateX(${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;

    case 'slideLeft':
       // image2 slides in from the left, covering image1
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateX(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      break;

    case 'slideTop':
      // image2 slides in from the top, covering image1
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateY(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      break;

    case 'slideBottom':
      // image2 slides in from the bottom, covering image1
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateY(${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;

    case 'none':
    default:
        // If no transition, image1 just disappears instantly and image2 appears (can cause flash)
        // Or we can just fade image1 out during the whole sequence
        styleImage1.opacity = interpolate(progress, [0, 1], [1, 0]); // Simple fade out if "none"
        styleImage2.opacity = interpolate(progress, [0, 1], [0, 1]); // Simple fade in if "none"
        break;

    // Implement more complex transitions here (cube, clockWipe require advanced CSS/canvas)
    // case 'cube':
    // case 'clockWipe':
    // break;
  }


  return (
    <AbsoluteFill>
       {/* Always render image1 underneath */}
      <Img
         src={staticFile(imageSrc1)}
         style={styleImage1}
      />
       {/* Render image2 on top, its visibility controlled by the transition style */}
       {/* Add a check for opacity > 0 or other visibility indicator to avoid rendering when not needed */}
       {(styleImage2.opacity > 0 || styleImage2.clipPath || styleImage2.transform) && (
           <Img
              src={staticFile(imageSrc2)}
              style={styleImage2}
           />
       )}
    </AbsoluteFill>
  );
};