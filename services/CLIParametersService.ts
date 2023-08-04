import { PrismaClient } from "@prisma/client";

import {
  CLIParameters,
  CreateCLIParametersInput,
  createCLIParametersInputSchema,
  UpdateCLIParametersInput,
  UpdateCLIParametersInputSchema,
} from "../models/CLIParameters.js";

const prisma = new PrismaClient();

// async function getAllCLIParameters(): Promise<CLIParameters[]> {
//   throw new Error("NotImplementedException");
// }

// async function getCLIParametersById(id: number): Promise<CLIParameters> {
//   return await prisma.cLIParameters.findUniqueOrThrow({
//     where:{
//       id: id
//     }
//   })
// }

async function createCLIParameters(newCLIParameters: CreateCLIParametersInput) {
  const cliParameters = createCLIParametersInputSchema.parse(newCLIParameters);

  return await prisma.cLIParameters.create({
    data: { ...cliParameters },
  });
}

async function updateCLIParameters(
  id: number,
  cliParametersToUpdate: UpdateCLIParametersInput
): Promise<CLIParameters> {
  const cliParameters = UpdateCLIParametersInputSchema.parse(cliParametersToUpdate);
  const updatedCLIParameters = await prisma.cLIParameters.update({
    where: { id: id },
    data: { ...cliParameters, status: "Enqueued" },
  });

  return updatedCLIParameters;
}

async function updateCLIParametersProgress(
  id: number,
  status: Pick<CLIParameters, "status">["status"]
) {
  await prisma.cLIParameters.update({
    where: { id: id },
    data: { status },
  });
}

async function deleteCLIParameters(id: number) {
  await prisma.cLIParameters.delete({
    where: { id: id },
  });
}

export default {
  updateCLIParametersProgress,
  createCLIParameters,
  updateCLIParameters,
  deleteCLIParameters,
};
