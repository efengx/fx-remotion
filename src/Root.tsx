import { Composition, getInputProps } from "remotion";
import { getResolution } from './node/Utils';
import { MyImage } from "./MyImage";
import {
  myImageSchema,
  ClipVideoProps,
  DEFAULT_IMAGE_PROPS,
  calculateImageMetadata,
} from './MyImage.loader';
import { MyAudio } from './MyAudio';
import { 
  DEFAULT_AUDIO_PROPS, 
  calculateAudioMetadata,
  myAudioSchema, 
} from './MyAudio.loader';


const inputProps = getInputProps() as ClipVideoProps;

export const RemotionRoot: React.FC = () => {
  // BEGIN - 设置
  // "left" | "right" | "top" | "bottom" | "kenBurnsRight" | "kenBurnsLeft" | "zoomIn" | "zoomOut";

  // 中间变量
  const { width, height } = getResolution(inputProps.direction);
  return (
    <>
      <Composition
        id="MyImage"                                            // 动画的Id用于识别是那个动画
        component={MyImage}
        fps={inputProps.fps}                                               // 帧率
        width={width}
        height={height}
        schema={myImageSchema}
        defaultProps={{
          ...DEFAULT_IMAGE_PROPS
        }}
        calculateMetadata={calculateImageMetadata}
      />

      <Composition
        id="MyAudio"                                            // 动画的Id用于识别是那个动画
        component={MyAudio}
        fps={inputProps.fps}                                               // 帧率
        width={width}
        height={height}
        schema={myAudioSchema}
        defaultProps={{
          ...DEFAULT_AUDIO_PROPS
        }}
        calculateMetadata={calculateAudioMetadata}
      />
    </>
  );
};
