import React, { useMemo } from "react";
import { Sequence, useVideoConfig, AbsoluteFill } from "remotion";
import type { WordTiming } from "../MyImage.loader";
import { groupWordsIntoLines } from "../node/Utils";
import { LineRenderer } from "./LineRenderer";

interface SubtitlesProps {
  wordTimings: WordTiming[]; // SRT 文件在 public 目录下的路径
  sceneIndex: number;
  activeColor?: string;
  inactiveColor?: string;
  highlightBackgroundColor?: string; // 高亮词的背景（可选）
  overallBackgroundColor?: string; // 整条字幕的背景
  fontSize?: number;
  lineHeight?: string;
  style?: React.CSSProperties; // 外部容器样式
  wordStyle?: React.CSSProperties; // 外部单词样式
  maxWordsPerLine?: number; // 新增：每行最大单词数
  wordParentStyle?: React.CSSProperties;  // 字幕外框的样式
}

const defaultStyles = {
  activeColor: 'rgb(255, 255, 0)',     // 选中颜色
  inactiveColor: 'white',   // 默认的颜色
  overallBackgroundColor: 'rgba(0, 0, 0, 0.45)',
  fontSize: 48,
  lineHeight: '1.5',
};

export const SubtitlesDisplay: React.FC<SubtitlesProps> = ({
  wordTimings,
  sceneIndex,
  activeColor = defaultStyles.activeColor,
  inactiveColor = defaultStyles.inactiveColor,
  highlightBackgroundColor, // 如果提供，则高亮词有背景色
  overallBackgroundColor = defaultStyles.overallBackgroundColor,
  fontSize = defaultStyles.fontSize,
  lineHeight = defaultStyles.lineHeight,
  wordParentStyle,
  style,
  wordStyle,
  maxWordsPerLine = 6, // 默认每行最多6个单词，可以调整
}) => {
  const { fps } = useVideoConfig();

  const subtitleLines = useMemo(() => {
    return groupWordsIntoLines(wordTimings, maxWordsPerLine);
  }, [wordTimings, maxWordsPerLine]);

  if (!subtitleLines || subtitleLines.length === 0) {
    return null;
  }

  const containerStyleBase: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    color: inactiveColor, // 默认文字颜色
    backgroundColor: overallBackgroundColor,
    borderRadius: "8px",
    textAlign: "center",
    width: "95%", // 容器宽度
    whiteSpace: "normal", // 允许自动换行
    ...style, // 外部传入的样式可以覆盖
  };

  return (
    <AbsoluteFill>
      {subtitleLines.map((line, lineIndex) => {
        let lineStartFrame = Math.floor(line.lineStartTime * fps);
        const lineEndFrame = Math.ceil(line.lineEndTime * fps); // 用 ceil 确保包含最后一个词的完整时长
        const lineDurationInFrames = lineEndFrame - lineStartFrame;

        if (lineDurationInFrames <= 0) return null;

        lineStartFrame = (sceneIndex === 0 && lineStartFrame === 0) ? lineStartFrame = 3 : lineStartFrame;
        return (
          <Sequence
            key={`line-${lineIndex}-${line.lineStartTime}`}
            from={lineStartFrame}
            durationInFrames={lineDurationInFrames}
          >
            <AbsoluteFill // 确保这个 LineRenderer 填满其父 Sequence
              style={wordParentStyle}
            >
              <LineRenderer
                line={line}
                fps={fps}
                activeColor={activeColor}         // 活动颜色
                inactiveColor={inactiveColor}     // 非活动颜色
                highlightBackgroundColor={highlightBackgroundColor} // 高亮显示文字
                containerStyleBase={containerStyleBase} // 单词画布的样式
                wordStyleProp={wordStyle} // 单词的样式
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
