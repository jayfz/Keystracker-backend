import { Request, Response } from "express";
import CLIParametersService from "../services/CLIParametersService.js";
import { failureResult, successResult } from "./common.js";
import { ZDatabaseId } from "../models/common.js";
import { cliInstanceQueue } from "../integrations/ProjectQueue.js";

export const create = async (request: Request, response: Response) => {
  const cliParameters = request.body;
  const createdCLIParameters = await CLIParametersService.createCLIParameters(
    cliParameters
  );

  await cliInstanceQueue.add("process-parameters", createdCLIParameters, {
    jobId: `c${createdCLIParameters.id}`,
  });

  response.status(201).send(successResult(createdCLIParameters));
};

export const update = async (request: Request, response: Response) => {
  const cliParameters = request.body;
  const idTest = ZDatabaseId.safeParse(request.params.id);

  if (!idTest.success) {
    response.status(404).send(failureResult(idTest.error));
    return;
  }

  const updatedProject = await CLIParametersService.updateCLIParameters(
    idTest.data,
    cliParameters
  );

  await cliInstanceQueue.add("process-parameters", updatedProject, {
    jobId: `c${updatedProject.id}`,
  });

  (await cliInstanceQueue.getJobs()).forEach((job) => console.log(job?.id));

  response.status(200).send(successResult(updatedProject));
};

export const remove = async (request: Request, response: Response) => {
  const idTest = ZDatabaseId.safeParse(request.params.id);

  if (!idTest.success) {
    response.status(404).send(failureResult(idTest.error));
    return;
  }

  await CLIParametersService.deleteCLIParameters(idTest.data);
  response.status(204).send(successResult());
};
