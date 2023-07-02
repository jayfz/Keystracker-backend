import { DatabaseIdSchema } from "../models/common.js";
import { Response, Request, NextFunction } from "express";

export function successResult(payload: object | object[] | null = null) {
  return {
    status: "success",
    data: payload,
  };
}

export function validateId(id: string): number {
  return DatabaseIdSchema.parse({ id: parseFloat(id) }).id;
}

export function needsApplicationJSONHeader(
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (
    (request.method == "POST" || request.method == "PUT" || request.method == "PATCH") &&
    request.headers["content-type"] != "application/json"
  ) {
    throw new SyntaxError("content-type header not found or not recognized");
  }
  next();
}
