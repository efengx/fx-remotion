import { CalculateMetadataFunction, Composition } from "remotion";
import { MyImage } from "./MyImage";
import { 
  calculateMyImageMetadata, 
  MyImageProps, 
  myImageSchema 
} from './MyImage.loader';


const calculateOverallMetadata: CalculateMetadataFunction<MyImageProps> = async ({
  props, defaultProps
}) => {
  const fps = defaultProps.fps;
  const loaderData = await calculateMyImageMetadata({ props, fps });

  return {
    durationInFrames: loaderData.durationInFrames,
    props: {
      ...props,
      processedScenes: loaderData.processedScenes,
      totalCompositionDurationFrames: loaderData.totalCompositionDurationFrames,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  // BEGIN - 设置
  // "left" | "right" | "top" | "bottom" | "kenBurnsRight" | "kenBurnsLeft" | "zoomIn" | "zoomOut";
  const clip_video = {
    "session_id": "7528d135-b2df-4656-bf86-0c47cf6db4e7",
    "direction": "16:9",
    "slideInDirection": "zoomIn",
    "zoomIntensity": 0.15,
    "panIntensity": 50,
    "scene_info": [
      {
        "chapter_index": "0",
        "sence_index": "0"
      },
      {
        "chapter_index": "0",
        "sence_index": "1"
      },
      {
        "chapter_index": "0",
        "sence_index": "2"
      },
      {
        "chapter_index": "0",
        "sence_index": "3"
      },
      {
        "chapter_index": "0",
        "sence_index": "4"
      },
      {
        "chapter_index": "0",
        "sence_index": "5"
      }
    ]
  };

  // 中间变量
  const direction = clip_video.direction.split(":");
  const width: number = (direction[0] == "16" ? 1344 : (direction[0] == "1" ? 1024 : 768));
  const height: number = (direction[1] == "16" ? 1344 : (direction[1] == "1" ? 1024 : 768));

  return (
    <>
      <Composition
        id="MyImage"                                            // 动画的Id用于识别是那个动画
        component={MyImage}
        fps={fps}                                               // 帧率
        width={width}
        height={height}
        schema={myImageSchema}
        defaultProps={{
          imageTargetWidth: width,
          imageTargetHeight: height,
          clipVideo: clip_video,
          fps: fps,
          processedScenes: [],
          totalCompositionDurationFrames: fps,
        }}
        calculateMetadata={calculateOverallMetadata}
      />
    </>
  );
};
