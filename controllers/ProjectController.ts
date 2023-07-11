import { Request, Response } from "express";
import ProjectService from "../services/ProjectService.js";
import { validateId, successResult } from "./common.js";

export const getAll = async (request: Request, response: Response) => {
  const projects = await ProjectService.getAllProjects();
  response.status(200).send(successResult(projects));
};

export const getById = async (request: Request, response: Response) => {
  const id = validateId(request.params.id);
  const project = await ProjectService.getProject(id);
  response.status(200).send(successResult(project));
};

export const create = async (request: Request, response: Response) => {
  const project = request.body;
  const createdProject = await ProjectService.createProject(project);
  response.status(201).send(successResult(createdProject));
};

export const update = async (request: Request, response: Response) => {
  const project = request.body;
  project.id = validateId(request.params.id);
  const UpdatedProject = await ProjectService.updateProject(project);
  response.status(200).send(successResult(UpdatedProject));
};

export const remove = async (request: Request, response: Response) => {
  const id = validateId(request.params.id);
  await ProjectService.deleteProject(id);
  response.status(204).send(successResult());
};
