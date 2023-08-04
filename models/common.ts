import { z } from "zod";

const idMessage = {
  message: "not a valid Id",
};
export const ZDatabaseId = z.coerce.number().int(idMessage).positive(idMessage);

export const DatabaseRecordSchema = z.strictObject({
  id: ZDatabaseId,
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type DatabaseRecord = z.infer<typeof DatabaseRecordSchema>;
