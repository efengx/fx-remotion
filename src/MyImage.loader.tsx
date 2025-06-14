import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { Caption } from '@remotion/captions';
import { getCaptions, getAudioDurationInFrames } from './node/Utils'


const TRANSITION_DURATION_SECONDS = 0.5;                                                          // 例如，0.5秒的转场

export const BackgroundAnimation = [
  "left",
  "right",
  "top",
  "bottom"
]

export const ForegroundAnimation = [
  "kenBurnsRight",
  "kenBurnsLeft",
  "zoomIn",
  "zoomOut"
];

const TransitionTypes = [
  "fade",
  "wipeRight",
  "wipeLeft",
  "slideRight",
  "slideLeft",
  "slideTop",
  "slideBottom",
  // 可以根据需要增加其他转场类型，如 cube, clockWipe 等，但这需要更复杂的TransitionOverlay实现
] as const;

export const TransitionTypeSchema = z.enum(TransitionTypes);
export type TransitionType = z.infer<typeof TransitionTypeSchema>;

export interface ImageItem {
  index: number,
  level: number,
  effect: string,
  transpart: number,
  imagePath: string,
}

export interface ProcessedSceneInfoForLoader {                                                    // 与 MyImage 组件中的定义保持一致或类似
  key: string;
  chapter_index: number;
  sence_index: number;
  images: ImageItem[],                                                                           // 原始路径，组件中再用 staticFile
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

export const myImageSchema = z.object({
  fps: z.number(),
  totalCompositionDurationFrames: z.number(),
  processedScenes: z.array(
    z.object({
      key: z.string(),
      chapter_index: z.number(),
      sence_index: z.number(),
      images: z.array(z.object({
        index: z.number(),
        level: z.number(),
        effect: z.string(),
        transpart: z.number(),
        imagePath: z.string(),
      })),
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
  session_id: z.string(),
  slideInDirection: z.string(),
  direction: z.string(),
  globalBackgroundColor: z.string(),
  zoomIntensity: z.number(),
  panIntensity: z.number(),
  scene_info: z.array(
    z.object({
      chapter_index: z.number(),
      sence_index: z.number(),
      images: z.array(
        z.object({
          index: z.number(),
          level: z.number(),
          effect: z.string(),
          transpart: z.number(),
        })
      )
    })
  )
})
export type ClipVideoProps = z.infer<typeof myImageSchema>;

export const DEFAULT_IMAGE_PROPS: ClipVideoProps = {
  "session_id": "0c710c5d-4231-4d98-aa09-0a1a0996534c",
  "direction": "16:9",
  "globalBackgroundColor": "#D3D3D3",
  "slideInDirection": "bottom",
  "zoomIntensity": 0.15,
  "panIntensity": 50,
  "fps": 30,
  "processedScenes": [],
  "totalCompositionDurationFrames": 30,
  "scene_info": [
    {
      "chapter_index": 0,
      "sence_index": 0,
      "images": [
        {
          "index": 0,
          "level": 1,
          "effect": "empty",
          "transpart": 0
        },
        {
          "index": 1,
          "level": 2,
          "effect": "right",
          "transpart": 1
        }
      ]
    }
  ]
};

export const calculateMyImageMetadata = async (props: ClipVideoProps): Promise<CalculatedMetadata> => {
  if (!props || !props.scene_info || props.scene_info.length === 0) {
    return {
      durationInFrames: props.fps * 1,                                                                  // 至少1秒
      processedScenes: [],
      totalCompositionDurationFrames: props.fps * 1
    };
  }

  const transitionDurationFrames = Math.round(TRANSITION_DURATION_SECONDS * props.fps);
  const processedScenes: ProcessedSceneInfoForLoader[] = [];
  let totalAudioDurationInFrames = 0;

  for (const [index, sence] of props.scene_info.entries()) {
    const audioPath = `voice/chapter_${sence.chapter_index}-voice_${sence.sence_index}-${props.session_id}.mp3`;
    const srtPath = `srt/chapter_${sence.chapter_index}-srt_${sence.sence_index}-${props.session_id}.srt`;

    const audioDurationInFrames = await getAudioDurationInFrames({audioPath: audioPath, fps: props.fps});
    const { captions } = await getCaptions({srtPath: srtPath});

    const transitionType = index < props.scene_info.length - 1
      ? TransitionTypes[index % TransitionTypes.length]                                           // 循环分配转场类型
      : undefined;

    processedScenes.push({
      key: `scene-${sence.chapter_index}-${sence.sence_index}-${index}`,
      chapter_index: sence.chapter_index,
      sence_index: sence.sence_index,
      images: sence.images.map(item => {
        return {
          ...item,
          imagePath: `image/chapter_${sence.chapter_index}-scene_${sence.sence_index}-image_${item.index}-${props.session_id}.png` 
        }
      }),                                                                                         // 传递原始路径
      audioSrcPath: audioPath,                                                                    // 传递原始路径
      audioDurationInFrames,
      captions,
      transitionType,
    });
    totalAudioDurationInFrames += audioDurationInFrames;
  }
  const totalCompositionDurationFrames = totalAudioDurationInFrames + transitionDurationFrames;

  return {
    durationInFrames: Math.max(props.fps, totalCompositionDurationFrames),
    processedScenes,
    totalCompositionDurationFrames,
  };
};

export const calculateImageMetadata: CalculateMetadataFunction<ClipVideoProps> = async ({
  props
}) => {
  const loaderData = await calculateMyImageMetadata(props);

  return {
    durationInFrames: loaderData.durationInFrames,
    props: {
      ...props,
      processedScenes: loaderData.processedScenes,
      totalCompositionDurationFrames: loaderData.totalCompositionDurationFrames,
    },
  };
};
