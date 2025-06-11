import { staticFile } from 'remotion';
import { parseSrt, ParseSrtOutput } from '@remotion/captions';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const getCaptions = async (
    {srtPath} : { srtPath: string }
) : Promise<ParseSrtOutput> => {
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
    return parseSrt({input: srtContent.trim()});
}

export const getAudioDurationInFrames = async (
    {audioPath, fps} : {audioPath: string, fps: number}
) : Promise<number> => {
    let audioDurationInFrames = 3 * fps;                                                          // 默认音频时长
    try {
        const durationInSeconds = await getAudioDurationInSeconds(staticFile(audioPath));
        audioDurationInFrames = Math.ceil(durationInSeconds * fps);
    } catch (e) {
        console.warn(`Loader: Failed to get audio duration for ${audioPath}. Using default.`, e);
    }
    return audioDurationInFrames;
}