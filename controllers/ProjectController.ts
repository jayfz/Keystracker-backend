import { Request, Response } from "express";
import ProjectService from "../services/ProjectService.js";
import { successResult, failureResult } from "./common.js";
import { projectQueue } from "../integrations/ProjectQueue.js";
import { ZDatabaseId } from "../models/common.js";

export const getAll = async (request: Request, response: Response) => {
  const projects = await ProjectService.getAllProjects();
  response.status(200).send(successResult(projects));
};

export const getById = async (request: Request, response: Response) => {
  const idTest = ZDatabaseId.safeParse(request.params.id);

  if (!idTest.success) {
    response.status(404).send(failureResult(idTest.error));
    return;
  }

  const project = await ProjectService.getProject(idTest.data);
  response.status(200).send(successResult(project));
};

export const create = async (request: Request, response: Response) => {
  const project = request.body;
  const createdProject = await ProjectService.createProject(project);
  await projectQueue.add("process-project", createdProject, {
    jobId: `p${createdProject.id}`,
  });
  response.status(201).send(successResult(createdProject));
};

export const update = async (request: Request, response: Response) => {
  const idTest = ZDatabaseId.safeParse(request.params.id);

  if (!idTest.success) {
    response.status(404).send(failureResult(idTest.error));
    return;
  }

  const project = request.body;
  const UpdatedProject = await ProjectService.updateProject(idTest.data, project);
  response.status(200).send(successResult(UpdatedProject));
};

export const remove = async (request: Request, response: Response) => {
  const idTest = ZDatabaseId.safeParse(request.params.id);

  if (!idTest.success) {
    response.status(404).send(failureResult(idTest.error));
    return;
  }

  await ProjectService.deleteProject(idTest.data);
  response.status(204).send(successResult());
};
