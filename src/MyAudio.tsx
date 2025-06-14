import React from "react";
import { AudioProps } from "./MyAudio.loader";
import { OffthreadVideo, Audio, staticFile, Sequence } from "remotion";

export const MyAudio: React.FC<AudioProps> = (props) => {
  
  return (
    <div style={{ flex: 1, backgroundColor: "white" }}>
      <OffthreadVideo src={staticFile(props.videoPath)} />

      {props.loopIndices.map((index) => {
        const startFrame = index * props.audioDurationInFrames;

        if (startFrame >= props.videoDurationInFrames) {
            return null;
        }

        return (
          <Sequence
            key={`audio-sequence-${index}`}
            from={startFrame} 
            durationInFrames={props.audioDurationInFrames}
          >
            <Audio
              // key={`audio-loop-${index}`}
              src={staticFile(props.bgMusicPath)}
              // startFrom={index * props.audioDurationInFrames}                                   // 从音乐的开头播放                 
              // endAt={durationInFrames}                         // 如果需要音乐在特定时间结束
              volume={0.5}                                        // 0 到 1 之间的值，可选，用于初步调整
            />
          </Sequence> 
        )
      })}
    </div>
  );
};
