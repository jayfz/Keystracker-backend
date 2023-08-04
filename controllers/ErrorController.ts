import { Request, Response, NextFunction } from "express";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library.js";
import { ZodError } from "zod";
import { failureResult } from "./common.js";

function errorResult(message: string) {
  return {
    status: "error",
    message: message,
  };
}

function getZodErrorObject(error: ZodError) {
  const zodFormattedErrors = error.flatten();

  const errors: string[] = [];

  const formErrorField = zodFormattedErrors.formErrors.join(", also, ");
  if (formErrorField) errors.push(zodFormattedErrors.formErrors.join(", also, "));

  for (const key in zodFormattedErrors.fieldErrors) {
    errors.push(
      `field error: [${key}] : ${(zodFormattedErrors.fieldErrors[key] as string[]).join(
        ", also, "
      )}`
    );
  }

  return errors;
}

function formatedPrismaError(
  error: PrismaClientKnownRequestError | PrismaClientUnknownRequestError
): string {
  const formatted = error.message
    .split("\n")
    .filter((line) => !line.includes("invocation") && line.length != 0);
  return formatted.join(",");
}

export function ErrorController(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) {
  let errorHasBeenHandled = false;

  if (error instanceof PrismaClientKnownRequestError) {
    errorHasBeenHandled = true;
    const NotFound = "P2025";
    const UniqueConstraintViolation = "P2002";
    const ForeignKeyConstraintViolation = "P2003";

    switch (error.code) {
      case NotFound:
        response.status(404).send(failureResult(formatedPrismaError(error)));
        break;
      case UniqueConstraintViolation:
      case ForeignKeyConstraintViolation:
      default:
        response.status(400).send(failureResult(formatedPrismaError(error)));
    }
  }

  if (error instanceof PrismaClientUnknownRequestError) {
    errorHasBeenHandled = true;
    response.status(500).send(errorResult(formatedPrismaError(error)));
  }

  if (error instanceof ZodError) {
    errorHasBeenHandled = true;
    const zodIssues = getZodErrorObject(error);
    response.status(400).send(failureResult(zodIssues));
  }

  if (error instanceof SyntaxError) {
    errorHasBeenHandled = true;
    response.status(400).send(failureResult(error.message));
  }

  if (!errorHasBeenHandled) {
    response.status(500).send(errorResult("Unknown transaction error."));
  }

  next();
}
