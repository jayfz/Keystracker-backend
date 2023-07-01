import { PrismaClient } from "@prisma/client";

import {
  CLIParameters,
  UnsavedCLIParameters,
  UnsavedCLIParametersSchema,
  UpdatedCLIParametersSchema,
  UpdatedCLIParameters,
} from "../models/CLIParameters.js";

const prisma = new PrismaClient();

async function getAllCLIParameters(): Promise<CLIParameters[]> {
  throw new Error("NotImplementedException");
}

async function getCLIParameters(id: number): Promise<CLIParameters> {
  throw new Error("NotImplementedException");
}

async function createCLIParameters(newCLIParameters: UnsavedCLIParameters) {
  const cliParameters = UnsavedCLIParametersSchema.parse(newCLIParameters);

  await prisma.cLIParameters.create({
    data: { ...cliParameters },
  });
}

async function updateCLIParameters(cliParametersToUpdate: UpdatedCLIParameters) {
  const cliParameters = UpdatedCLIParametersSchema.parse(cliParametersToUpdate);
  await prisma.cLIParameters.update({
    where: { id: cliParameters.id },
    data: { ...cliParameters },
  });
}

async function deleteCLIParameters(id: number) {
  await prisma.cLIParameters.delete({
    where: { id: id },
  });
}

export default {
  createCLIParameters,
  updateCLIParameters,
  deleteCLIParameters,
};
