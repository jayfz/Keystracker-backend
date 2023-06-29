import { z } from "zod";
import { DatabaseRecordSchema, DatabaseIdSchema } from "./common.js";
import { CLIParameters } from "./CLIParameters.js";

export const UnsavedProjectSchema = z.strictObject({
  name: z.string().trim().nonempty(),
  url: z.string().url().includes("youtube.com"),
});

export const UpdateProjectSchema = UnsavedProjectSchema.partial().and(DatabaseIdSchema);

const ProjectSchema = UnsavedProjectSchema.and(DatabaseRecordSchema);

export type UnsavedProject = z.infer<typeof UnsavedProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithParameters = Project & {
  cliParameters: CLIParameters[];
};
export type UpdatedProject = z.infer<typeof UpdateProjectSchema>;
