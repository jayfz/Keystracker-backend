import Express, { Request, Response, NextFunction } from "express";
import * as ProjectController from "../controllers/ProjectController.js";

const ProjectRouter = Express.Router();

//ProjectRouter.use(needsApplicationJSONHeader);
ProjectRouter.get("/", ProjectController.getAll);
ProjectRouter.get("/:id", ProjectController.getById);
ProjectRouter.post("/", ProjectController.create);
ProjectRouter.patch("/:id", ProjectController.update);
ProjectRouter.delete("/:id", ProjectController.remove);

export default ProjectRouter;
