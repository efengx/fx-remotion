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
      // gapBetweenImagesFrames: loaderData.gapBetweenImagesFrames,
    },
  };
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  // BEGIN - 设置
  const clip_video = {
    "session_id": "7528d135-b2df-4656-bf86-0c47cf6db4e7",
    "direction": "16:9",
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
      },
      {
        "chapter_index": "1",
        "sence_index": "6"
      },
      {
        "chapter_index": "1",
        "sence_index": "7"
      },
      {
        "chapter_index": "1",
        "sence_index": "8"
      },
      {
        "chapter_index": "1",
        "sence_index": "9"
      },
      {
        "chapter_index": "1",
        "sence_index": "10"
      },
      {
        "chapter_index": "1",
        "sence_index": "11"
      },
      {
        "chapter_index": "1",
        "sence_index": "12"
      },
      {
        "chapter_index": "1",
        "sence_index": "13"
      },
      {
        "chapter_index": "1",
        "sence_index": "14"
      },
      {
        "chapter_index": "2",
        "sence_index": "15"
      },
      {
        "chapter_index": "2",
        "sence_index": "16"
      },
      {
        "chapter_index": "2",
        "sence_index": "17"
      },
      {
        "chapter_index": "2",
        "sence_index": "18"
      },
      {
        "chapter_index": "2",
        "sence_index": "19"
      },
      {
        "chapter_index": "2",
        "sence_index": "20"
      },
      {
        "chapter_index": "3",
        "sence_index": "21"
      },
      {
        "chapter_index": "3",
        "sence_index": "22"
      },
      {
        "chapter_index": "3",
        "sence_index": "23"
      },
      {
        "chapter_index": "3",
        "sence_index": "24"
      },
      {
        "chapter_index": "3",
        "sence_index": "25"
      },
      {
        "chapter_index": "3",
        "sence_index": "26"
      },
      {
        "chapter_index": "3",
        "sence_index": "27"
      },
      {
        "chapter_index": "3",
        "sence_index": "28"
      },
      {
        "chapter_index": "4",
        "sence_index": "29"
      },
      {
        "chapter_index": "4",
        "sence_index": "30"
      },
      {
        "chapter_index": "4",
        "sence_index": "31"
      },
      {
        "chapter_index": "4",
        "sence_index": "32"
      },
      {
        "chapter_index": "4",
        "sence_index": "33"
      },
      {
        "chapter_index": "4",
        "sence_index": "34"
      },
      {
        "chapter_index": "4",
        "sence_index": "35"
      },
      {
        "chapter_index": "4",
        "sence_index": "36"
      },
      {
        "chapter_index": "5",
        "sence_index": "37"
      },
      {
        "chapter_index": "5",
        "sence_index": "38"
      },
      {
        "chapter_index": "5",
        "sence_index": "39"
      },
      {
        "chapter_index": "5",
        "sence_index": "40"
      },
      {
        "chapter_index": "5",
        "sence_index": "41"
      },
      {
        "chapter_index": "6",
        "sence_index": "42"
      },
      {
        "chapter_index": "6",
        "sence_index": "43"
      },
      {
        "chapter_index": "6",
        "sence_index": "44"
      },
      {
        "chapter_index": "6",
        "sence_index": "45"
      },
      {
        "chapter_index": "6",
        "sence_index": "46"
      },
      {
        "chapter_index": "6",
        "sence_index": "47"
      },
      {
        "chapter_index": "6",
        "sence_index": "48"
      },
      {
        "chapter_index": "7",
        "sence_index": "49"
      },
      {
        "chapter_index": "7",
        "sence_index": "50"
      },
      {
        "chapter_index": "7",
        "sence_index": "51"
      },
      {
        "chapter_index": "7",
        "sence_index": "52"
      },
      {
        "chapter_index": "7",
        "sence_index": "53"
      },
      {
        "chapter_index": "8",
        "sence_index": "54"
      },
      {
        "chapter_index": "8",
        "sence_index": "55"
      },
      {
        "chapter_index": "8",
        "sence_index": "56"
      },
      {
        "chapter_index": "8",
        "sence_index": "57"
      },
      {
        "chapter_index": "8",
        "sence_index": "58"
      },
      {
        "chapter_index": "8",
        "sence_index": "59"
      },
      {
        "chapter_index": "9",
        "sence_index": "60"
      },
      {
        "chapter_index": "9",
        "sence_index": "61"
      },
      {
        "chapter_index": "9",
        "sence_index": "62"
      },
      {
        "chapter_index": "9",
        "sence_index": "63"
      },
      {
        "chapter_index": "9",
        "sence_index": "64"
      },
      {
        "chapter_index": "9",
        "sence_index": "65"
      },
      {
        "chapter_index": "10",
        "sence_index": "66"
      },
      {
        "chapter_index": "10",
        "sence_index": "67"
      },
      {
        "chapter_index": "10",
        "sence_index": "68"
      },
      {
        "chapter_index": "10",
        "sence_index": "69"
      },
      {
        "chapter_index": "10",
        "sence_index": "70"
      },
      {
        "chapter_index": "10",
        "sence_index": "71"
      },
      {
        "chapter_index": "10",
        "sence_index": "72"
      },
      {
        "chapter_index": "11",
        "sence_index": "73"
      },
      {
        "chapter_index": "11",
        "sence_index": "74"
      },
      {
        "chapter_index": "11",
        "sence_index": "75"
      },
      {
        "chapter_index": "12",
        "sence_index": "76"
      },
      {
        "chapter_index": "12",
        "sence_index": "77"
      },
      {
        "chapter_index": "12",
        "sence_index": "78"
      },
      {
        "chapter_index": "12",
        "sence_index": "79"
      },
      {
        "chapter_index": "12",
        "sence_index": "80"
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
          fps: fps
        }}
        calculateMetadata={calculateOverallMetadata}
      />
    </>
  );
};
