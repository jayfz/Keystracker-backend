import { Request, Response, NextFunction } from "express";
import { DatabaseIdSchema } from "../models/common.js";
import ProjectService from "../services/ProjectService.js";
import ValidationError from "../errors/ValidationError.js";

function successResult(payload: object | object[] | null = null) {
  return {
    status: "success",
    data: payload,
  };
}

function validateId(id: string): number {
  return DatabaseIdSchema.parse({ id: parseInt(id) }).id;
}

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
  ProjectService.createProject(project);
  response.status(201).send(successResult());
};

export const update = async (request: Request, response: Response) => {
  const project = request.body;
  project.id = validateId(request.params.id);
  const UpdatedProject = ProjectService.updateProject(project);
  response.status(200).send(successResult(UpdatedProject));
};

export const remove = async (request: Request, response: Response) => {
  const id = validateId(request.params.id);
  ProjectService.deleteProject(id);
  response.status(204).send(successResult());
};
