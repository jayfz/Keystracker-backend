import { PrismaClient } from "@prisma/client";

import {
  CLIParameters,
  createCLIParametersInput,
  createCLIParametersInputSchema,
  UpdateCLIParametersInput,
  UpdateCLIParametersInputSchema,
} from "../models/CLIParameters.js";

const prisma = new PrismaClient();

// async function getAllCLIParameters(): Promise<CLIParameters[]> {
//   throw new Error("NotImplementedException");
// }

// async function getCLIParameters(id: number): Promise<CLIParameters> {
//   throw new Error("NotImplementedException");
// }

async function createCLIParameters(newCLIParameters: createCLIParametersInput) {
  const cliParameters = createCLIParametersInputSchema.parse(newCLIParameters);

  await prisma.cLIParameters.create({
    data: { ...cliParameters },
  });
}

async function updateCLIParameters(
  cliParametersToUpdate: UpdateCLIParametersInput
): Promise<CLIParameters> {
  const cliParameters = UpdateCLIParametersInputSchema.parse(cliParametersToUpdate);
  const updatedCLIParameters = await prisma.cLIParameters.update({
    where: { id: cliParameters.id },
    data: { ...cliParameters },
  });

  return updatedCLIParameters;
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
