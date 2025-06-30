import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";
import { TransitionType } from "../MyImage.loader"; // 导入转场类型

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

  const baseImageStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const styleImage1: React.CSSProperties = { ...baseImageStyle };
  const styleImage2: React.CSSProperties = { ...baseImageStyle };

  styleImage1.opacity = 1;
  styleImage2.opacity = 0; // Initially hide image2 for many transitions

  switch (transitionType) {
    case "fade":
      styleImage1.opacity = interpolate(progress, [0, 1], [1, 0]);
      styleImage2.opacity = interpolate(progress, [0, 1], [0, 1]);
      break;

    case "wipeRight":
      styleImage1.opacity = 1; // Image 1 stays visible until wiped over
      styleImage2.opacity = 1; // Image 2 becomes visible as it's clipped
      styleImage2.clipPath = `inset(0px ${interpolate(progress, [0, 1], [100, 0])}% 0px 0px)`;
      break;

    case "wipeLeft":
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.clipPath = `inset(0px 0px 0px ${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;

    case "slideRight":
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateX(${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;

    case "slideLeft":
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateX(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      break;

    case "slideTop":
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateY(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      break;

    case "slideBottom":
      styleImage1.opacity = 1;
      styleImage2.opacity = 1;
      styleImage2.transform = `translateY(${interpolate(progress, [0, 1], [100, 0])}%)`;
      break;
    default:
      styleImage1.opacity = interpolate(progress, [0, 1], [1, 0]); // Simple fade out if "none"
      styleImage2.opacity = interpolate(progress, [0, 1], [0, 1]); // Simple fade in if "none"
      break;

  }

  return (
    <AbsoluteFill>
      <Img src={staticFile(imageSrc1)} style={styleImage1} />
      {(styleImage2.opacity > 0 ||
        styleImage2.clipPath ||
        styleImage2.transform) && (
        <Img src={staticFile(imageSrc2)} style={styleImage2} />
      )}
    </AbsoluteFill>
  );
};
