import { PrismaClient } from "@prisma/client";

import {
  Project,
  ProjectWithParameters,
  UnsavedProject,
  UnsavedProjectSchema,
  UpdateProjectSchema,
  UpdatedProject,
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

async function createProject(newProject: UnsavedProject) {
  const validation = UnsavedProjectSchema.safeParse(newProject);
  if (validation.success) {
    await prisma.project.create({
      data: { ...validation.data },
    });
  }
}

async function updateProject(projectToUpdate: UpdatedProject): Promise<Project> {
  const project = UpdateProjectSchema.parse(projectToUpdate);
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
