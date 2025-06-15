import { staticFile } from "remotion";
import { parseSrt, ParseSrtOutput } from "@remotion/captions";
import { 
  getAudioDurationInSeconds,
} from "@remotion/media-utils";
import {parseMedia} from '@remotion/media-parser';
import {
  WordTiming,
  SubtitleLine,
} from '../MyImage.loader';

export const getCaptions = async ({
  srtPath,
}: {
  srtPath: string;
}): Promise<ParseSrtOutput> => {
  let srtContent: string = "";
  try {
    const response = await fetch(staticFile(srtPath));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    srtContent = (await response.text()).trim();
  } catch (e) {
    console.warn(`Loader: Failed to load SRT file content for ${srtPath}.`, e);
  }
  return parseSrt({ input: srtContent.trim() });
};

export const getWordTimingsFromFile = async ({srtWordPath} : { srtWordPath: string;}): Promise<{ wordTimings: WordTiming[] }> => {
  try {
    let srtContent: string = "[]";
    // const fileContent = await fs.readFile(staticFile(srtWordPath), 'utf-8');
    const response = await fetch(staticFile(srtWordPath));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    srtContent = (await response.text()).trim();
    const parsedJson = JSON.parse(srtContent);
    return { wordTimings: parsedJson["words"] as WordTiming[] };
  } catch (e) {
    console.error(`Error reading or parsing word timings JSON file ${srtWordPath}:`, e);
    return { wordTimings: [] };
  }
}

// 辅助函数：将单词列表分割成行/块
export const groupWordsIntoLines = (
  words: WordTiming[],
  maxWordsPerLine: number
): SubtitleLine[] => {
  if (!words || words.length === 0) {
    return [];
  }
  const lines: SubtitleLine[] = [];
  let currentLineWords: WordTiming[] = [];

  for (let i = 0; i < words.length; i++) {
    currentLineWords.push(words[i]);

    if (currentLineWords.length >= maxWordsPerLine || i === words.length - 1) {
      const lineStartTime = currentLineWords[0].start;
      const lineEndTime = currentLineWords[currentLineWords.length - 1].end;
      lines.push({
        words: [...currentLineWords],                                 // 复制数组
        lineStartTime,
        lineEndTime,
        text: currentLineWords.map(w => w.word).join(' '),            // 简单拼接
      });
      currentLineWords = [];                                          // 开始新的一行
    }
  }
  return lines;
}


export const getAudioDurationInFrames = async ({
  audioPath,
  fps,
}: {
  audioPath: string;
  fps: number;
}): Promise<number> => {
  let audioDurationInFrames = 3 * fps; // 默认音频时长
  try {
    const durationInSeconds = await getAudioDurationInSeconds(
      staticFile(audioPath),
    );
    
    audioDurationInFrames = Math.ceil(durationInSeconds * fps) + 0.5 * fps;
  } catch (e) {
    console.warn(
      `Loader: Failed to get audio duration for ${audioPath}. Using default.`,
      e,
    );
  }
  return audioDurationInFrames;
};

export const getVideoDurationInFrames = async ({
  videoPath,
  fps,
} : { videoPath: string, fps: number}) : Promise<number> => {
  let videoDurationInFrames = 3 * fps; // 默认音频时长
  try {
    const metadata = await parseMedia({ 
      src: staticFile(videoPath),
      fields: {
        durationInSeconds: true,
        dimensions: true,
      },
    });
    videoDurationInFrames = Math.ceil((metadata.durationInSeconds || 1) * fps);
  } catch (e) {
    console.warn(`Loader: Failed to get audio duration for ${videoPath}. Using default.`, e);
  }
  return videoDurationInFrames;
}

export const getResolution = (direction: string) => {
  const directionList = direction.split(":");
  return {
    width:
      directionList[0] == "16" ? 1344 : directionList[0] == "1" ? 1024 : 768,
    height:
      directionList[1] == "16" ? 1344 : directionList[1] == "1" ? 1024 : 768,
  };
};
