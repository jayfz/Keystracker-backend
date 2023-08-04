import { Job, Queue, Worker } from "bullmq";
import { Project } from "../models/Project.js";
import {
  createFileSystemProject,
  downloadVideo,
  extractH264StreamFromVideo,
  extractRandomVideoFrames,
  keystracker,
  transcodeVideoToH264Codec,
} from "./ProjectIntegration.js";
import { sendMessageToSubscribers } from "./WebsocketIntegration.js";
import { CLIParameters } from "../models/CLIParameters.js";
import ProjectService from "../services/ProjectService.js";
import CLIParametersService from "../services/CLIParametersService.js";

const redisConnection = {
  host: process.env.REDIS_CONNECTION_URL,
  port: parseInt(process.env.REDIS_CONNECTION_PORT as string),
};

export const projectQueue = new Queue("projects", { connection: redisConnection });
export const cliInstanceQueue = new Queue("cliInstance", { connection: redisConnection });

console.log("waiting to be processed", await projectQueue.count());
console.log("ongoing", await projectQueue.getActiveCount());
console.log("completed", await projectQueue.getCompletedCount());
console.log("waiting", await projectQueue.getWaitingCount());
console.log("failed", await projectQueue.getFailedCount());

// sendMessageToSubscribers(`
//     Waiting to be processed: ${await projectQueue.count()}.
//     Ongoing:" ${await projectQueue.getActiveCount()}.
//     Completed: ${await projectQueue.getCompletedCount()}
//     Waiting: ${await projectQueue.getWaitingCount()}
//     Failed: ${await projectQueue.getFailedCount()}
// `);

// await projectQueue.drain()
// await projectQueue.clean(0,100, "failed");
//await projectQueue.obliterate();

const projectWorker = new Worker<Project>(
  "projects",
  async (job: Job<Project>) => {
    const project = job.data;
    await ProjectService.updateProjectProgress(project.id, "Processing");
    const projectPath = await createFileSystemProject(project.id);
    await job.updateProgress(1 / 5);

    const downloadedVideoPath = await downloadVideo(project.url, projectPath);
    await job.updateProgress(2 / 5);

    const transcodedVideoPath = await transcodeVideoToH264Codec(
      downloadedVideoPath,
      projectPath
    );
    await job.updateProgress(3 / 5);

    const h264stream = await extractH264StreamFromVideo(transcodedVideoPath, projectPath);
    await job.updateProgress(4 / 5);

    const frames = await extractRandomVideoFrames(downloadedVideoPath, projectPath);
    await job.updateProgress(5 / 5);

    return {
      projectPath,
      downloadedVideoPath,
      transcodedVideoPath,
      h264stream,
      frames,
    };
  },
  { connection: redisConnection }
);

projectWorker.on("failed", async (job, error) => {
  console.error("Worker failed", job?.id, error);

  if (job?.data.id) {
    await ProjectService.updateProjectProgress(job.data.id, "Failed");
  }
});

projectWorker.on("error", (reason) => {
  console.error("Worker failed", reason);
});

projectWorker.on("progress", (job, progress) => {
  if (typeof progress === "number") {
    const message = `Progress for job ${job.id} with name ${
      job.data.name
    } is ${Math.floor(progress * 100)}`;
    sendMessageToSubscribers(message);
    console.log(message);
  }
});

projectWorker.on("completed", async (job, result, prev) => {
  console.log(`Work completed for job ${job.id} with name ${job.data.name}`, result);

  await ProjectService.updateProjectProgress(job.data.id, "Completed");
});

projectQueue.on("error", (err) => {
  console.error("error in queue", err);
});

const cliparameterWorker = new Worker<CLIParameters>(
  "cliInstance",
  async (job: Job<CLIParameters>) => {
    const projectId = job.data.projectId;
    const project = await ProjectService.getProject(projectId);

    if (project.status !== "Completed") {
      throw new Error(`project with id ${project.id} is not ready yet`);
    }

    await keystracker(job.data);
  },
  { connection: redisConnection }
);

cliparameterWorker.on("completed", async (job, result, prev) => {
  sendMessageToSubscribers(`cli job ${job.id} completed`);
  await CLIParametersService.updateCLIParametersProgress(job.data.id, "Completed");
});

cliparameterWorker.on("failed", async (job, error) => {
  sendMessageToSubscribers(`cli job ${job?.id} failed ${error}`);

  if (job?.data.id) {
    await CLIParametersService.updateCLIParametersProgress(job.data.id, "Failed");
  }
});

cliparameterWorker.on("error", (error) => {
  console.log(`cli parameter worker failed ${error.message}`);
});
