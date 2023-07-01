import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import { ZodError, ZodIssue } from "zod";

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

function getZodErrorObject(error: ZodError) {
  const zodFormattedErrors = error.flatten();

  let errors: string[] = [];

  errors.push(zodFormattedErrors.formErrors.join(", also, "));
  for (const key in zodFormattedErrors.fieldErrors) {
    errors.push(
      `field error: [${key}] : ${(zodFormattedErrors.fieldErrors[key] as string[]).join(
        ", also, "
      )}`
    );
  }

  return errors;
}

function formatedPrismaError(error: PrismaClientKnownRequestError): string {
  if (error.meta) {
    if ("target" in error.meta) {
      const fields = (error.meta.target as Array<string>).join(",") || "";
      return `constraint error on field(s): ${fields}`;
    }

    if ("cause" in error.meta) {
      return error.meta.cause as string;
    }
  }

  return error.message;
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
    const NotFoundErrorCode = "P2025";
    const ConstraintViolation = "P2002";

    switch (error.code) {
      case NotFoundErrorCode:
        response.status(404).send(failureResult(formatedPrismaError(error)));
        break;
      case ConstraintViolation:
        response.status(400).send(failureResult(formatedPrismaError(error)));
        break;
      default:
        response.status(500).send(errorResult("Unknown transaction error."));
    }
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
