import { z } from "zod";
import { DatabaseRecordSchema, ZDatabaseId } from "./common.js";

const hexColorRegex = new RegExp("#[0-9A-Fa-f]{6}", "g");

export const createCLIParametersInputSchema = z.strictObject({
  projectId: ZDatabaseId,
  leftHandWhiteKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  leftHandBlackKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  rightHandWhiteKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  rightHandBlackKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  firstOctaveAt: z.coerce.number().int().positive(),
  octavesLength: z.coerce.number().int().positive(),
  numberOfOctaves: z.coerce.number().int().positive(),
  rawFrameLinesToExtract: z.coerce.number().int().positive(),
  rawFrameCopyFromLine: z.coerce.number().int().positive(),
  trackMode: z.enum(["FallingNotes", "Keys"]),
  numberOfFramesToSkip: z.coerce.number().int().positive(),
  processFramesDivisibleBy: z.coerce.number().int().positive()
});

export const UpdateCLIParametersInputSchema = createCLIParametersInputSchema.omit({projectId: true}).partial()

export const CLIParametersSchema = createCLIParametersInputSchema.merge(DatabaseRecordSchema).merge(z.strictObject({ status: z.enum(["Enqueued", "Processing", "Failed", "Completed"])}));

export type CreateCLIParametersInput = z.infer<typeof createCLIParametersInputSchema>;
export type UpdateCLIParametersInput = z.infer<typeof UpdateCLIParametersInputSchema>;
export type CLIParameters = z.infer<typeof CLIParametersSchema>;
