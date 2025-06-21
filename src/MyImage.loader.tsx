import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { getWordTimingsFromFile, getAudioDurationInFrames } from './node/Utils'


const TRANSITION_DURATION_SECONDS = 0.5;                                                          // 例如，0.5秒的转场

export const StandardAnimation = [
  "left",
  "right",
  "top",
  "bottom"
]

export const KenBurnsAnimation = [
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

export interface WordTiming { 
  word: string; 
  start: number; 
  end: number; 
}

export interface SubtitleLine {
  words: WordTiming[];                          // 这一行包含的单词
  lineStartTime: number;                        // 这一行开始显示的时间
  lineEndTime: number;                          // 这一行结束显示的时间 (最后一个词的结束时间)
  text: string;                                 // 这一行所有单词拼接成的文本 (可选，方便渲染)
}

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
  wordTimings: WordTiming[];
  transitionType?: TransitionType;
}

interface CalculatedMetadata {
  durationInFrames: number;
  thumbnailImage: string;
  processedScenes: ProcessedSceneInfoForLoader[];                                                 // 将处理好的场景数据传递下去
  totalCompositionDurationFrames: number,
}

export const myImageSchema = z.object({
  fps: z.number(),
  totalCompositionDurationFrames: z.number(),
  thumbnailImage: z.string(),
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
      wordTimings: z.array(
        z.object({
          word: z.string(), 
          start: z.number(),
          end: z.number(),
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
  "session_id": "a628abb5-77ac-4f67-b7da-12cf82c0d37f",
  "direction": "16:9",
  "globalBackgroundColor": "#D3D3D3",
  "slideInDirection": "left",
  "zoomIntensity": 0.15,
  "thumbnailImage": "",
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
    },
    {
      "chapter_index": 0,
      "sence_index": 1,
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
    },
    {
      "chapter_index": 0,
      "sence_index": 2,
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
    },
    {
      "chapter_index": 1,
      "sence_index": 3,
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
    },
    {
      "chapter_index": 1,
      "sence_index": 4,
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
    },
    {
      "chapter_index": 1,
      "sence_index": 5,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 1,
      "sence_index": 6,
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
    },
    {
      "chapter_index": 1,
      "sence_index": 7,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 1,
      "sence_index": 8,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 1,
      "sence_index": 9,
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
    },
    {
      "chapter_index": 1,
      "sence_index": 10,
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
    },
    {
      "chapter_index": 2,
      "sence_index": 11,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 2,
      "sence_index": 12,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 2,
      "sence_index": 13,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 2,
      "sence_index": 14,
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
    },
    {
      "chapter_index": 2,
      "sence_index": 15,
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
    },
    {
      "chapter_index": 2,
      "sence_index": 16,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 2,
      "sence_index": 17,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 2,
      "sence_index": 18,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 19,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 20,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 21,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 22,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 23,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 3,
      "sence_index": 24,
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
    },
    {
      "chapter_index": 3,
      "sence_index": 25,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 26,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 27,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 28,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 4,
      "sence_index": 29,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 4,
      "sence_index": 30,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 31,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 32,
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
    },
    {
      "chapter_index": 4,
      "sence_index": 33,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 5,
      "sence_index": 34,
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
    },
    {
      "chapter_index": 5,
      "sence_index": 35,
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
          "effect": "empty",
          "transpart": 1
        }
      ]
    },
    {
      "chapter_index": 5,
      "sence_index": 36,
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
    },
    {
      "chapter_index": 5,
      "sence_index": 37,
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
  const transitionDurationFrames = Math.round(TRANSITION_DURATION_SECONDS * props.fps);
  const processedScenes: ProcessedSceneInfoForLoader[] = [];
  let totalAudioDurationInFrames = 0;
  
  for (const [index, sence] of props.scene_info.entries()) {
    const audioPath = `voice/chapter_${sence.chapter_index}-voice_${sence.sence_index}-${props.session_id}.mp3`;
    const srtWordPath = `srt/chapter_${sence.chapter_index}-srt_${sence.sence_index}-${props.session_id}.json`;

    const audioDurationInFrames = await getAudioDurationInFrames({audioPath: audioPath, fps: props.fps});
    const { wordTimings } = await getWordTimingsFromFile({srtWordPath: srtWordPath});

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
      wordTimings,
      transitionType,
    });
    totalAudioDurationInFrames += audioDurationInFrames;
  }
  const totalCompositionDurationFrames = totalAudioDurationInFrames + transitionDurationFrames;

  const thumbnailImage = (props.direction === "9:16" ? `image/thumbnail-${props.session_id}.png` : "");
  return {
    durationInFrames: Math.max(props.fps, totalCompositionDurationFrames),
    thumbnailImage,
    processedScenes,
    totalCompositionDurationFrames,
  };
};

export const calculateImageMetadata: CalculateMetadataFunction<ClipVideoProps> = async ({
  props, defaultProps
}) => {
  props = props.direction ? props : defaultProps;
  const loaderData = await calculateMyImageMetadata(props);

  return {
    durationInFrames: loaderData.durationInFrames,
    props: {
      ...props,
      thumbnailImage: loaderData.thumbnailImage,
      processedScenes: loaderData.processedScenes,
      totalCompositionDurationFrames: loaderData.totalCompositionDurationFrames,
    },
  };
};
