import { z } from "zod";
import { DatabaseRecordSchema } from "./common.js";

const hexColorRegex = new RegExp("#[0-9A-Fa-f]{6}", "g");

export const UnsavedCLIParametersSchema = z.strictObject({
  projectId: z.number().int().positive(),
  inputVideoFilename: z.string().min(6),
  leftHandWhiteKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  leftHandBlackKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  rightHandWhiteKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  rightHandBlackKeyColor: z.string().trim().toUpperCase().regex(hexColorRegex),
  firstOctaveAt: z.number().int().positive(),
  octavesLength: z.number().int().positive(),
  numberOfOctaves: z.number().int().positive(),
  rawFrameLinesToExtract: z.number().int().positive(),
  rawFrameCopyFromLine: z.number().int().positive(),
  trackMode: z.enum(["FallingNotes", "Keys"]),
  numberOfFramesToSkip: z.number().int().positive(),
  processFramesDivisibleBy: z.number().int().positive().optional(),
  outFileName: z.string().trim().nonempty().optional(),
});

export const UpdatedCLIParametersSchema = UnsavedCLIParametersSchema.partial().and(
  z.strictObject({
    id: z.number(),
  })
);

export const CLIParametersSchema = UnsavedCLIParametersSchema.and(DatabaseRecordSchema);

export type UnsavedCLIParameters = z.infer<typeof UnsavedCLIParametersSchema>;
export type CLIParameters = z.infer<typeof CLIParametersSchema>;
export type UpdatedCLIParameters = z.infer<typeof UpdatedCLIParametersSchema>;
