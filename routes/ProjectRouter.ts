import Express, { Request, Response, NextFunction } from "express";
import * as ProjectController from "../controllers/ProjectController.js";

const ProjectRouter = Express.Router();

const needsApplicationJSONHeader = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (
    (request.method == "POST" || request.method == "PUT" || request.method == "PATCH") &&
    request.headers["content-type"] != "application/json"
  ) {
    throw new SyntaxError("content-type header not found or not recognized");
  }
  next();
};

ProjectRouter.use(needsApplicationJSONHeader);
ProjectRouter.get("/", ProjectController.getAll);
ProjectRouter.get("/:id", ProjectController.getById);
ProjectRouter.post("/", ProjectController.create);
ProjectRouter.patch("/:id", ProjectController.update);
ProjectRouter.delete("/:id", ProjectController.remove);

export default ProjectRouter;
