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
  return (
    <>
      <Composition
        id="MyImage"                                                        // 动画的Id用于识别是那个动画
        component={MyImage}
        fps={inputProps.fps ? inputProps.fps : DEFAULT_IMAGE_PROPS.fps}                                                // 帧率
        width={
          (inputProps.direction ? getResolution(inputProps.direction) : getResolution(DEFAULT_IMAGE_PROPS.direction)).width
        }
        height={
          (inputProps.direction ? getResolution(inputProps.direction) : getResolution(DEFAULT_IMAGE_PROPS.direction)).height
        }
        schema={myImageSchema}
        defaultProps={{
          ...DEFAULT_IMAGE_PROPS
        }}
        calculateMetadata={calculateImageMetadata}
      />

      <Composition
        id="MyAudio"                                                        // 动画的Id用于识别是那个动画
        component={MyAudio}
        fps={inputProps.fps ? inputProps.fps : DEFAULT_AUDIO_PROPS.fps}                                                // 帧率
        width={
          (inputProps.direction ? getResolution(inputProps.direction) : getResolution(DEFAULT_AUDIO_PROPS.direction)).width
        }
        height={
          (inputProps.direction ? getResolution(inputProps.direction) : getResolution(DEFAULT_AUDIO_PROPS.direction)).height
        }
        schema={myAudioSchema}
        defaultProps={{
          ...DEFAULT_AUDIO_PROPS
        }}
        calculateMetadata={calculateAudioMetadata}
      />
    </>
  );
};
