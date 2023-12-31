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
import { ServerStatus, sendMessageToSubscribers } from "./WebsocketIntegration.js";
import { CLIParameters } from "../models/CLIParameters.js";
import ProjectService from "../services/ProjectService.js";
import CLIParametersService from "../services/CLIParametersService.js";

const redisConnection = {
  host: process.env.REDIS_CONNECTION_URL,
  port: parseInt(process.env.REDIS_CONNECTION_PORT as string),
};

export const projectQueue = new Queue("projects", { connection: redisConnection });
export const cliInstanceQueue = new Queue("cliInstance", { connection: redisConnection });

console.log("project queue");
console.log("waiting to be processed", await projectQueue.count());
console.log("ongoing", await projectQueue.getActiveCount());
console.log("completed", await projectQueue.getCompletedCount());
console.log("waiting", await projectQueue.getWaitingCount());
console.log("failed", await projectQueue.getFailedCount());

console.log("cliInstanceQueue queue");
console.log("waiting to be processed", await cliInstanceQueue.count());
console.log("ongoing", await cliInstanceQueue.getActiveCount());
console.log("completed", await cliInstanceQueue.getCompletedCount());
console.log("waiting", await cliInstanceQueue.getWaitingCount());
console.log("failed", await cliInstanceQueue.getFailedCount());

// sendMessageToSubscribers(`
//     Waiting to be processed: ${await projectQueue.count()}.
//     Ongoing:" ${await projectQueue.getActiveCount()}.
//     Completed: ${await projectQueue.getCompletedCount()}
//     Waiting: ${await projectQueue.getWaitingCount()}
//     Failed: ${await projectQueue.getFailedCount()}
// `);

// await projectQueue.drain()
// await projectQueue.clean(0,100, "failed");
// await projectQueue.obliterate();
// await cliInstanceQueue.obliterate();

const projectWorker = new Worker<Project>(
  "projects",
  async (job: Job<Project>) => {
    const project = job.data;
    await ProjectService.updateProjectProgress(project.id, "Processing", []);
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
  { connection: redisConnection, removeOnComplete: { count: 0 } }
);

projectWorker.on("failed", async (job, error) => {
  console.error("Worker failed", job?.id, error);

  if (job?.data.id) {
    await ProjectService.updateProjectProgress(job.data.id, "Failed", []);
  }

  const failedStatus: ServerStatus = {
    status: "Failed",
    message: `Job with id ${job?.id} failed`,
  };

  sendMessageToSubscribers(failedStatus);
});

projectWorker.on("error", (reason) => {
  console.error("Worker failed", reason);
});

projectWorker.on("progress", (job, progress) => {
  if (typeof progress === "number") {
    const progressPercentage = Math.floor(progress * 100);
    const message = `Progress for job ${job.id} with name ${job.data.name} is ${progressPercentage}`;

    const progressStatus: ServerStatus = {
      status: "Processing",
      message: `Job with id ${job?.id} is currently running`,
      progress: progressPercentage,
    };

    sendMessageToSubscribers(progressStatus);
    console.log(message);
  }
});

projectWorker.on("completed", async (job, result, prev) => {
  console.log(`Work completed for job ${job.id} with name ${job.data.name}`, result);
  const frames = result.frames ? result.frames : [];
  await ProjectService.updateProjectProgress(job.data.id, "Completed", frames);

  const completedStatus: ServerStatus = {
    status: "Completed",
    message: `Job with id ${job?.id} has completed. You may start adding CLI parameters`,
  };

  sendMessageToSubscribers(completedStatus);
});

projectQueue.on("error", (err) => {
  console.error("error in queue", err);
});

const cliparameterWorker = new Worker<CLIParameters>(
  "cliInstance",
  async (job: Job<CLIParameters>) => {
    await CLIParametersService.updateCLIParametersProgress(job.data.id, "Processing");

    const projectId = job.data.projectId;
    const project = await ProjectService.getProject(projectId);

    if (project.status !== "Completed") {
      throw new Error(`project with id ${project.id} is not ready yet`);
    }

    await keystracker(job.data);
  },
  { connection: redisConnection, removeOnComplete: { count: 0 } }
);

cliparameterWorker.on("completed", async (job, result, prev) => {
  await CLIParametersService.updateCLIParametersProgress(job.data.id, "Completed");

  const completedStatus: ServerStatus = {
    status: "Completed",
    message: `CLI Job with id ${job.id} has completed.`,
  };

  sendMessageToSubscribers(completedStatus);
});

cliparameterWorker.on("failed", async (job, error) => {
  if (job?.data.id) {
    await CLIParametersService.updateCLIParametersProgress(job.data.id, "Failed");
  }

  const failedStatus: ServerStatus = {
    status: "Failed",
    message: `cli job ${job?.id} failed ${error}`,
  };

  sendMessageToSubscribers(failedStatus);
});

cliparameterWorker.on("error", (error) => {
  console.log(`cli parameter worker failed ${error.message}`);
});
