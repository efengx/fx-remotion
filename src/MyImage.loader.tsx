import { z } from "zod";
import { Caption } from '@remotion/captions';
import { getCaptions, getAudioDurationInFrames } from './node/Utils'


const TRANSITION_DURATION_SECONDS = 0.5;                                                          // 例如，0.5秒的转场

export type SlideDirection = 
  | "left" 
  | "right" 
  | "top" 
  | "bottom" 
  | "kenBurnsRight" 
  | "kenBurnsLeft" 
  | "zoomIn" 
  | "zoomOut" 
  | "none";

const TransitionTypes = [
  "fade",
  "wipeRight",
  "wipeLeft",
  "slideRight",
  "slideLeft",
  "slideTop",
  "slideBottom",
  "none",
  // 可以根据需要增加其他转场类型，如 cube, clockWipe 等，但这需要更复杂的TransitionOverlay实现
] as const;

export const TransitionTypeSchema = z.enum(TransitionTypes);
export type TransitionType = z.infer<typeof TransitionTypeSchema>;

export interface ProcessedSceneInfoForLoader {                                                    // 与 MyImage 组件中的定义保持一致或类似
  key: string;
  chapter_index: string;
  sence_index: string;
  imageSrc: string;                                                                               // 原始路径，组件中再用 staticFile
  audioSrcPath: string;                                                                           // 原始路径，组件中再用 staticFile
  audioDurationInFrames: number;
  captions: Caption[];
  transitionType?: TransitionType;
}

interface CalculatedMetadata {
  durationInFrames: number;
  processedScenes: ProcessedSceneInfoForLoader[];                                                 // 将处理好的场景数据传递下去
  totalCompositionDurationFrames: number,
}

interface CalculateMyImageMetadataParams {
  props: MyImageProps;
  fps: number;
}

export const myImageSchema = z.object({
  fps: z.number().positive(),
  imageTargetWidth: z.number(),
  imageTargetHeight: z.number(),
  clipVideo: z.object({
    session_id: z.string(),
    slideInDirection: z.string(),
    zoomIntensity: z.number(),
    panIntensity: z.number(),
    scene_info: z.array(z.object({
      chapter_index: z.string(),
      sence_index: z.string()
    }))
  }),
  processedScenes: z.array(
    z.object({
      key: z.string(),
      chapter_index: z.string(),
      sence_index: z.string(),
      imageSrc: z.string(),
      audioSrcPath: z.string(),
      audioDurationInFrames: z.number(),
      captions: z.array(
        z.object({
          text: z.string(),
          startMs: z.number(),
          endMs: z.number(),
          timestampMs: z.number().nullable(),
          confidence: z.number().nullable()
        })
      ),
      transitionType: TransitionTypeSchema.optional(),
    })
  ),
  totalCompositionDurationFrames: z.number().positive(),
});

export type MyImageProps = z.infer<typeof myImageSchema>;

export const calculateMyImageMetadata = async ({
  props,
  fps
}: CalculateMyImageMetadataParams): Promise<CalculatedMetadata> => {
  const { clipVideo } = props;

  if (!clipVideo || !clipVideo.scene_info || clipVideo.scene_info.length === 0) {
    return {
      durationInFrames: fps * 1,                                                                  // 至少1秒
      processedScenes: [],
      totalCompositionDurationFrames: fps * 1
    };
  }

  const transitionDurationFrames = Math.round(TRANSITION_DURATION_SECONDS * fps);
  const processedScenes: ProcessedSceneInfoForLoader[] = [];
  let totalAudioDurationInFrames = 0;

  for (const [index, sence] of clipVideo.scene_info.entries()) {
    const imageSrc = `image/chapter_${sence.chapter_index}-image_${sence.sence_index}-${clipVideo.session_id}.png`;
    const audioPath = `voice/chapter_${sence.chapter_index}-voice_${sence.sence_index}-${clipVideo.session_id}.mp3`;
    const srtPath = `srt/chapter_${sence.chapter_index}-srt_${sence.sence_index}-${clipVideo.session_id}.srt`;

    const audioDurationInFrames = await getAudioDurationInFrames({audioPath: audioPath, fps: fps});
    const { captions } = await getCaptions({srtPath: srtPath});

    const transitionType = index < clipVideo.scene_info.length - 1
      ? TransitionTypes[index % TransitionTypes.length] // 循环分配转场类型
      : undefined;

    processedScenes.push({
      key: `scene-${sence.chapter_index}-${sence.sence_index}-${index}`,
      chapter_index: sence.chapter_index,
      sence_index: sence.sence_index,
      imageSrc,                                                                                   // 传递原始路径
      audioSrcPath: audioPath,                                                                    // 传递原始路径
      audioDurationInFrames,
      captions,
      transitionType,
    });

    totalAudioDurationInFrames += audioDurationInFrames;
  }
  const totalCompositionDurationFrames = totalAudioDurationInFrames + transitionDurationFrames;

  return {
    durationInFrames: Math.max(fps, totalCompositionDurationFrames),
    processedScenes,
    totalCompositionDurationFrames,
  };
};