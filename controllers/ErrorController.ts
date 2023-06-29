import { Request, Response, NextFunction } from "express";
import ValidationError from "../errors/ValidationError.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { ZodError, ZodIssue } from "zod";

// function getErrorOutput(message: string | any[]) {
//   return {
//     error: message,
//   };
// }

// if (error instanceof ValidationError) {
//   error.
//   response.status(400).send(failureResult(getZodIssueInfo()));
// }

function failureResult(payload: object | object[] | string | null = null) {
  return {
    status: "fail",
    data: payload,
  };
}

function errorResult(message: string) {
  return {
    status: "error",
    message: message,
  };
}

function getZodIssueInfo(zodIssues: ZodIssue[]) {
  const issues = zodIssues.map((err) => {
    return {
      message: err.message,
      path: err.path,
    };
  });

  return issues;
}

export function ErrorController(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  if (error instanceof PrismaClientKnownRequestError) {
    const NotFoundErrorCode = "P2025";

    switch (error.code) {
      case NotFoundErrorCode:
        response.status(404).send(failureResult(error.message));
        break;

      default:
        response.status(500).send(errorResult("Unknown error."));
        break;
    }
  }

  if (error instanceof ZodError) {
    const zodIssues = getZodIssueInfo(error.errors);
    response.status(400).send(failureResult(zodIssues));
  }

  next(error);
}
