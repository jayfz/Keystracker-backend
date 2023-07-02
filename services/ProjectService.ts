import { PrismaClient } from "@prisma/client";

import {
  Project,
  ProjectWithParameters,
  createProjectInput,
  CreateProjectInputSchema,
  UpdateProjectInput,
  UpdateProjectInputSchema,
} from "../models/Project.js";

const prisma = new PrismaClient();

async function getAllProjects(): Promise<Project[]> {
  return await prisma.project.findMany();
}

async function getProject(id: number): Promise<ProjectWithParameters> {
  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: id,
    },
    include: {
      cliParameters: true,
    },
  });
  return project;
}

async function createProject(newProject: createProjectInput) {
  const project = CreateProjectInputSchema.parse(newProject);
  await prisma.project.create({
    data: { ...project },
  });
}

async function updateProject(projectToUpdate: UpdateProjectInput): Promise<Project> {
  const project = UpdateProjectInputSchema.parse(projectToUpdate);
  const modifiedProject = await prisma.project.update({
    where: { id: project.id },
    data: { ...project },
  });
  return modifiedProject;
}

async function deleteProject(id: number) {
  await prisma.project.delete({
    where: { id: id },
  });
}

export default {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
