import { z } from "zod";
import { CalculateMetadataFunction } from "remotion";
import { 
  getVideoDurationInFrames,
  getAudioDurationInFrames,
} from "./node/Utils";

export const myAudioSchema = z.object({
  fps: z.number(),
  direction: z.string(),
  videosName: z.string(),
  backgroundMusicName: z.string(),
  videoPath: z.string(),
  bgMusicPath: z.string(),
  videoDurationInFrames: z.number(),
  audioDurationInFrames: z.number(),
  loopIndices: z.array(z.number())
});
export type AudioProps = z.infer<typeof myAudioSchema>;

export const DEFAULT_AUDIO_PROPS: AudioProps = {
  fps: 30,
  direction: "16:9",
  videosName: "video-a628abb5-77ac-4f67-b7da-12cf82c0d37f.mp4",
  backgroundMusicName: "1_01.mp3",

  videoDurationInFrames: 30,
  audioDurationInFrames: 30,
  videoPath: "",
  bgMusicPath: "",
  loopIndices: [],
};

export const calculateAudioMetadata: CalculateMetadataFunction<
  AudioProps
> = async ({ props }) => {
  const videoPath = `full_video/${props.videosName}`;
  const bgMusicPath = `sound/music/${props.backgroundMusicName}`;

  const videoDurationInFrames = await getVideoDurationInFrames({videoPath: videoPath, fps: props.fps});
  const audioDurationInFrames = await getAudioDurationInFrames({audioPath: bgMusicPath, fps: props.fps});

  const numLoops = Math.ceil(videoDurationInFrames / audioDurationInFrames);
  const loopIndices = Array.from({ length: numLoops }, (_, i) => i);

  return {
    durationInFrames: Math.max(props.fps, videoDurationInFrames),
    props: {
      ...props,
      videoPath: videoPath,
      bgMusicPath: bgMusicPath,
      videoDurationInFrames: videoDurationInFrames,
      audioDurationInFrames: audioDurationInFrames,
      loopIndices: loopIndices,
    },
  };
};
