import { z } from "zod";
import { DatabaseRecordSchema } from "./common.js";
import { CLIParameters } from "./CLIParameters.js";

export const CreateProjectInputSchema = z.strictObject({
  name: z.string().trim().min(3, { message: "Name must be at least 3 characters long" }),
  url: z
    .string()
    .trim()
    .url({ message: "Must be a valid URL" })
    .includes("youtube.com", { message: "The URL must be a Youtube URL" }),
});

export const UpdateProjectInputSchema = CreateProjectInputSchema.omit({
  url: true,
}).partial();

const ProjectSchema = DatabaseRecordSchema.merge(CreateProjectInputSchema).merge(
  z.strictObject({
    status: z.enum(["Enqueued", "Processing", "Failed", "Completed"]),
    thumbnails: z.string().array(),
  })
);

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithParameters = Project & { cliParameters: CLIParameters[] };
