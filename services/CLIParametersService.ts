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
  const validation = UnsavedCLIParametersSchema.safeParse(newCLIParameters);

  if (validation.success) {
    await prisma.cLIParameters.create({
      data: { ...newCLIParameters },
    });
  }
}

async function updateCLIParameters(cliParametersToUpdate: UpdatedCLIParameters) {
  try {
    const cliParameters = UpdatedCLIParametersSchema.parse(cliParametersToUpdate);
    await prisma.cLIParameters.update({
      where: { id: cliParameters.id },
      data: { ...cliParameters },
    });
  } catch (error) {
    console.log(error);
  }
}

async function deleteCLIParameters(id: number) {
  try {
    await prisma.cLIParameters.delete({
      where: { id: id },
    });
  } catch (error) {
    console.log(error);
  }
}

export default {
  createCLIParameters,
  updateCLIParameters,
  deleteCLIParameters,
};
