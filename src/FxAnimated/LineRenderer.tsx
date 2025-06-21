import { useCurrentFrame, AbsoluteFill } from "remotion";
import type { SubtitleLine } from "../MyImage.loader";

interface LineRendererProps {
  line: SubtitleLine;
  fps: number;
  activeColor: string;
  inactiveColor: string;
  highlightBackgroundColor?: string;
  containerStyleBase: React.CSSProperties;
  wordStyleProp?: React.CSSProperties;
  wordParentStyle?: React.CSSProperties;
}

export const LineRenderer: React.FC<LineRendererProps> = ({
  line,
  fps,
  activeColor,
  inactiveColor,
  highlightBackgroundColor,
  containerStyleBase,
  wordStyleProp,
  wordParentStyle,
}) => {
  const frame = useCurrentFrame(); // 这是相对于当前行的 Sequence 的帧数
  const currentTimeInLineSequence = frame / fps;

  return (
    <AbsoluteFill // 确保这个 LineRenderer 填满其父 Sequence
      style={wordParentStyle}
    >
      <div style={containerStyleBase}>
        {line.words.map((wordInfo, wordIndex) => {
          // 将单词的绝对开始/结束时间转换为相对于当前行 Sequence 的时间
          // line.lineStartTime 是当前行（也就是当前Sequence）在整个音频中的开始时间
          const wordStartTimeInLine = wordInfo.start - line.lineStartTime;
          const wordEndTimeInLine = wordInfo.end - line.lineStartTime;

          const isActive =
            currentTimeInLineSequence >= wordStartTimeInLine &&
            currentTimeInLineSequence < wordEndTimeInLine;

          const individualWordStyle: React.CSSProperties = {
            display: "inline-block",
            marginRight: "0.2em",
            transition: "color 0.05s linear, background-color 0.05s linear", // 更快的过渡
            color: isActive ? activeColor : inactiveColor,
            fontWeight: isActive ? "bold" : "normal",
            ...(isActive &&
              highlightBackgroundColor && {
                backgroundColor: highlightBackgroundColor,
                padding: "0 0.2em",
                borderRadius: "3px",
              }),
            ...wordStyleProp,
          };

          return (
            <span
              key={`${wordInfo.word}-${wordIndex}-${wordInfo.start}`}
              style={individualWordStyle}
            >
              {wordInfo.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
