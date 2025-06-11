import { z } from "zod";
import { staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { Caption, parseSrt } from '@remotion/captions';

const GAP_BETWEEN_IMAGES_SECONDS = 0.1;

export interface ProcessedSceneInfoForLoader {      // 与 MyImage 组件中的定义保持一致或类似
  key: string;
  chapter_index: string;
  sence_index: string;
  imageSrc: string;                                 // 原始路径，组件中再用 staticFile
  audioSrcPath: string;                             // 原始路径，组件中再用 staticFile
  audioDurationInFrames: number;
  captions: Caption[];
}

interface CalculatedMetadata {
  durationInFrames: number;
  processedScenes: ProcessedSceneInfoForLoader[];   // 将处理好的场景数据传递下去
  gapBetweenImagesFrames: number;                   // 可以传递其他全局配置，如 gapBetweenImagesFrames
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
    scene_info: z.array(z.object({
        chapter_index: z.string(),
        sence_index: z.string()
    }))
  }),
  processedScenes: z.array(z.object({
      key: z.string(),
      chapter_index: z.string(),
      sence_index: z.string(),
      imageSrc: z.string(),
      audioSrcPath: z.string(),
      audioDurationInFrames: z.number(),
      captions: z.array(z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
        timestampMs: z.number().nullable(),
        confidence: z.number().nullable()
      }))
  })).optional(),
  gapBetweenImagesFrames: z.number().optional(),
});

export type MyImageProps = z.infer<typeof myImageSchema>;

export interface ProcessedScenes {
  key: string;
  chapter_index: string;
  sence_index: string;
  imageSrc: string;       // 原始路径
  audioSrcPath: string;   // 原始路径
  audioDurationInFrames: number;
  captions: Caption[];
}


export const calculateMyImageMetadata = async ({
  props,
  fps
}: CalculateMyImageMetadataParams): Promise<CalculatedMetadata> => {
  const { clipVideo } = props;

  if (!clipVideo || !clipVideo.scene_info || clipVideo.scene_info.length === 0) {
    return {
      durationInFrames: fps * 1,                                        // 至少1秒
      processedScenes: [],
      gapBetweenImagesFrames: Math.round(GAP_BETWEEN_IMAGES_SECONDS * fps),
    };
  }

  const gapBetweenImagesFrames = Math.round(GAP_BETWEEN_IMAGES_SECONDS * fps);
  const processedScenes: ProcessedSceneInfoForLoader[] = [];
  let totalFrames = 0;

  for (const [index, sence] of clipVideo.scene_info.entries()) {
    const imageSrc = `image/chapter_${sence.chapter_index}-image_${sence.sence_index}-${clipVideo.session_id}.png`;
    const audioPath = `voice/chapter_${sence.chapter_index}-voice_${sence.sence_index}-${clipVideo.session_id}.mp3`;
    const srtPath = `srt/chapter_${sence.chapter_index}-srt_${sence.sence_index}-${clipVideo.session_id}.srt`;

    let audioDurationInFrames = 3 * fps; // Default
    try {
      // 在 Node.js 环境中，staticFile 只是返回路径，getAudioDurationInSeconds 需要能访问到 public 目录
      const durationInSeconds = await getAudioDurationInSeconds(staticFile(audioPath));
      audioDurationInFrames = Math.ceil(durationInSeconds * fps);
    } catch (e) {
      console.warn(`Loader: Failed to get audio duration for ${audioPath}. Using default.`, e);
    }

    let srtContent: string = "";
    try {
      const response = await fetch(staticFile(srtPath));
      srtContent = (await response.text()).trim();
    } catch (e) {
      console.warn(`Loader: Failed to load SRT file content for ${srtPath}.`, e);
    }
    const { captions }  = parseSrt({input: srtContent.trim()});

    processedScenes.push({
      key: `scene-${sence.chapter_index}-${sence.sence_index}-${index}`,
      chapter_index: sence.chapter_index,
      sence_index: sence.sence_index,
      imageSrc,                                                             // 传递原始路径
      audioSrcPath: audioPath,                                              // 传递原始路径
      audioDurationInFrames,
      captions,
    });

    totalFrames += audioDurationInFrames + gapBetweenImagesFrames;
  }

  if (processedScenes.length > 0) {
    totalFrames -= gapBetweenImagesFrames;                              // Remove trailing gap
  }

  return {
    durationInFrames: Math.max(fps, totalFrames),                       //确保至少1秒
    processedScenes,
    gapBetweenImagesFrames,
  };
};