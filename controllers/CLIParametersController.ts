import { Request, Response } from "express";
import CLIParametersService from "../services/CLIParametersService.js";
import { validateId, successResult } from "./common.js";

export const create = async (request: Request, response: Response) => {
  const cliParameters = request.body;
  await CLIParametersService.createCLIParameters(cliParameters);
  response.status(201).send(successResult());
};

export const update = async (request: Request, response: Response) => {
  const cliParameters = request.body;
  cliParameters.id = validateId(request.params.id);
  const updatedProject = await CLIParametersService.updateCLIParameters(cliParameters);
  response.status(200).send(successResult(updatedProject));
};

export const remove = async (request: Request, response: Response) => {
  const id = validateId(request.params.id);
  await CLIParametersService.deleteCLIParameters(id);
  response.status(204).send(successResult());
};
