import fs from "node:fs/promises";
import  {spawn} from "node:child_process";
import os from "node:os"


const spawnedOptions = {
    timeout : 60000
}

export async function createFileSystemProject(projectId: number){

    const homedir = os.homedir();
    const pathToCreate =  `${homedir}/${process.env.PROJECTS_PATH}/${projectId}`;
    await fs.mkdir(pathToCreate, {recursive: true});
    return pathToCreate;
}

export function downloadVideo(videoUrl: string, outDir: string) : Promise<string> {

    const ytdlp = "yt-dlp";
    const videoPath =  `${outDir}/input.mp4`;

    const parameters = [
        videoUrl,
        "-S", "codec:h264",
        "-o", videoPath
    ];

    const spawned = spawn(ytdlp, parameters, spawnedOptions);

    return new Promise((resolve, reject) => {
        spawned.on("error", () => reject(`error downloading video ${videoUrl}`))
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error downloading video. process exited with ${code}`);
            }
            resolve(videoPath);
        })
    })
}

export async function transcodeVideoToH264Codec(videoPath: string, outDir: string) : Promise<string>{

    const ffmpeg = "ffmpeg";
    const newVideoPath = `${outDir}/output.mp4`;

    const parameters = [
        "-n",
        "-i", videoPath,
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "128k",
        newVideoPath
      ]

      const spawned = spawn(ffmpeg, parameters, spawnedOptions);

      return new Promise((resolve, reject) => {
        spawned.on("error", () => reject(`error transcoding video ${videoPath}`))
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error transcoding video. process exited with ${code}`);
            }
            resolve(newVideoPath);
        })
    })
}


export function extractH264StreamFromVideo(videoPath: string, outDir: string) : Promise<string>{

    const ffmpeg = "ffmpeg";
    const h264path = `${outDir}/output.h264`;
    const parameters = [
        "-n",
        "-i", videoPath,
        "-c:v", "copy",
        "-bsf:v" , "h264_mp4toannexb",
        "-an",
        h264path
    ]

    const spawned = spawn(ffmpeg, parameters, spawnedOptions);
    return new Promise((resolve, reject) => {

        spawned.on("error", () => reject(`error extracting h264 stream ${videoPath}`))
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error transcoding video. process exited with ${code}`);
            }
            resolve(h264path);
        })
    })
}

export function getVideoDurationInSeconds(videoPath: string) : Promise<number>{
    const ffprobe = "ffprobe";
    const parameters = [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        videoPath
    ]

    const spawned = spawn(ffprobe, parameters, spawnedOptions);
    let stdoutText: null | string = null;

    return new Promise((resolve, reject) => {

        spawned.on("error", () => reject(`error querying the video length ${videoPath}`))
        spawned.stdout.on('data',(data) => {
            stdoutText = data;
        })
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error querying the video length. process exited with ${code}`);
                return;
            }

            if(stdoutText === null){
                reject("could not determine duration");
                return;
            }

            const duration = parseInt(stdoutText);

            if(isNaN(duration)){
                reject(`not a valid duration ${stdoutText}`)
            }

            resolve(duration);
        })
    })

}

export function getVideoFrameRate(videoPath: string) : Promise<number>{

    const ffprobe = "ffprobe";
    const parameters = [
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=avg_frame_rate",
        "-of", "default=noprint_wrappers=1:nokey=1",
        videoPath
    ];

    const spawned = spawn(ffprobe, parameters, spawnedOptions);
    let stdoutText: null | string = null;

    return new Promise((resolve, reject) => {

        spawned.on("error", () => reject(`error querying the video framerate ${videoPath}`))
        spawned.stdout.on('data',(data) => {
            stdoutText = data.toString();
        })
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error querying the video frame rate. process exited with ${code}`);
                return;
            }

            if(stdoutText == null){
                reject("could not determine frame rate")
                return;
            }

            //this ffprobe command returns frame rate as  "30/1" for instance
            if(!stdoutText.includes("/")){
                reject("could not determine frame rate");
                return;
            }

            const [numberator, denominator] = stdoutText.split("/");
            const frameRate = Math.floor(parseInt(numberator) / parseInt(denominator));

            if(isNaN(frameRate)){
                reject("could not determine frame rate");
                return;
            }

            resolve(frameRate);
        })
    })
}

export function extractVideoFrame(videoPath: string, frameNumber : number, outDir: string): Promise<string>{

    const ffmpeg = "ffmpeg";
    const outputFrameName = `${outDir}/frame-${frameNumber}.jpg`;

    const parameters = [
        "-n",
        "-i", videoPath,
        "-vf", `select=eq(n\\,${frameNumber})`,
        "-vframes", "1",
        outputFrameName
    ]

    const spawned = spawn(ffmpeg, parameters, spawnedOptions);

    return new Promise((resolve, reject) => {

        spawned.on("error", () => reject(`error extracting frame ${frameNumber} from ${videoPath}`))
        spawned.on("exit", (code) => {
            if(code !== 0){
                reject(`error extracting frame ${frameNumber} from ${videoPath}. process exited with ${code}`);
                return;
            }

            resolve(outputFrameName);
        })
    })
}

function getRandomNumberUpTo(max: number){
    return Math.floor(Math.random() * max);
}

export async function extractRandomVideoFrames(videoPath: string, outDir: string){

    try {
        const videoLength = await getVideoDurationInSeconds(videoPath);
        const frameRate = await getVideoFrameRate(videoPath);
        const approximatedTotalFrames = videoLength * frameRate;
        const frameNumbers = new Set<number>();
        const half = (approximatedTotalFrames /2);

        while( frameNumbers.size != 5){
            frameNumbers.add(getRandomNumberUpTo(half));
        }

        const promises = [];
        for(const frame of frameNumbers){
            promises.push(extractVideoFrame(videoPath, frame, outDir));
        }

        const extractedFrames = await Promise.all(promises);
        return extractedFrames;

    } catch (error) {
        console.error(error);

    }
    return [];
}

