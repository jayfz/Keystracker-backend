import { z } from "zod";
import { DatabaseRecordSchema, DatabaseIdSchema } from "./common.js";
import { CLIParameters } from "./CLIParameters.js";

export const CreateProjectInputSchema = z.strictObject({
  name: z.string().trim().nonempty().min(3),
  url: z.string().url().includes("youtube.com"),
});

export const UpdateProjectInputSchema =
  CreateProjectInputSchema.partial().merge(DatabaseIdSchema);

const ProjectSchema = DatabaseRecordSchema.merge(CreateProjectInputSchema);

export type createProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithParameters = Project & {
  cliParameters: CLIParameters[];
};
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
