import { Response, Request, NextFunction } from "express";

export function successResult(payload: object | object[] | null = null) {
  return {
    status: "success",
    data: payload,
  };
}

export function failureResult(payload: object | object[] | string | null = null) {
  return {
    status: "fail",
    data: payload,
  };
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
