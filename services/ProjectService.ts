import { PrismaClient } from "@prisma/client";

import {
  Project,
  ProjectWithParameters,
  CreateProjectInput,
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

async function createProject(newProject: CreateProjectInput): Promise<Project> {
  const project = CreateProjectInputSchema.parse(newProject);
  const createdProject = await prisma.project.create({
    data: { ...project },
  });
  return createdProject;
}

async function updateProject(id: number, projectToUpdate: UpdateProjectInput): Promise<Project> {
  const project = UpdateProjectInputSchema.parse(projectToUpdate);
  const modifiedProject = await prisma.project.update({
    where: { id: id },
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
