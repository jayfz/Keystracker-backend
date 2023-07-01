import { DatabaseIdSchema } from "../models/common.js";

export function successResult(payload: object | object[] | null = null) {
  return {
    status: "success",
    data: payload,
  };
}

export function validateId(id: string): number {
  return DatabaseIdSchema.parse({ id: parseFloat(id) }).id;
}
