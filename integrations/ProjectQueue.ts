import { Job, Queue, Worker } from "bullmq";
import { Project } from "../models/Project.js";
import {createFileSystemProject, downloadVideo, extractH264StreamFromVideo, extractRandomVideoFrames, transcodeVideoToH264Codec} from "./ProjectIntegration.js"

const redisConnection = {
    host: process.env.REDIS_CONNECTION_URL,
    port: parseInt(process.env.REDIS_CONNECTION_PORT as string)
}

export const projectQueue = new Queue("projects", {connection: redisConnection});

console.log("waiting to be processed", await projectQueue.count())
console.log("ongoing", await projectQueue.getActiveCount())
console.log("completed", await projectQueue.getCompletedCount())
console.log("waiting", await projectQueue.getWaitingCount())
console.log("failed", await projectQueue.getFailedCount())
// await projectQueue.drain()
// await projectQueue.clean(0,100, "failed");
//await projectQueue.obliterate();

const worker = new Worker<Project>("projects", async (job: Job<Project>) => {

    console.log("inside worker! yay");
    await job.updateProgress(0/5)
    const project = job.data;
    const projectPath = await createFileSystemProject(project.id);
    await job.updateProgress(1/5)

    const downloadedVideoPath = await downloadVideo(project.url, projectPath)
    await job.updateProgress(2/5)
    
    const transcodedVideoPath = await transcodeVideoToH264Codec(downloadedVideoPath, projectPath);
    await job.updateProgress(3/5)
    
    const h264stream = await extractH264StreamFromVideo(transcodedVideoPath, projectPath)
    await job.updateProgress(4/5)
    
    const frames = await extractRandomVideoFrames(downloadedVideoPath, projectPath)
    await job.updateProgress(5/5);

    return {
        projectPath,
        downloadedVideoPath,
        transcodedVideoPath,
        h264stream,
        frames
    }
},{connection : redisConnection})



worker.on("error", (reason) => {
    console.error("Worker failed", reason);
})

worker.on("progress", (job, progress) => {
    if(typeof progress === "number" )
        console.log(`progress for job ${job.id} with name ${job.data.name} is ${Math.floor(progress*100)}`)
})

worker.on("completed", (job, result, prev) => {
    console.log(`Work completed for job ${job.id} with name ${job.data.name}`, result)
})

projectQueue.on("error", (err) => {
    console.error("error in queue",  err);

})

