import { z } from "zod";
import { CalculateMetadataFunction } from "remotion";

export const myAudioSchema = z.object({
  fps: z.number(),
  direction: z.string(),
  videosName: z.string(),
  backgroundMusicName: z.string(),
});
export type AudioProps = z.infer<typeof myAudioSchema>;

export const DEFAULT_AUDIO_PROPS: AudioProps = {
  fps: 30,
  direction: "1:1",
  videosName: "",
  backgroundMusicName: "",
};

export const calculateAudioMetadata: CalculateMetadataFunction<
  AudioProps
> = async ({ props }) => {
  return {
    durationInFrames: 0,
    props: {
      ...props,
    },
  };
};
