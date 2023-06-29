import Express from "express";
import * as ProjectController from "../controllers/ProjectController.js";
const router = Express.Router();

router.get("/", ProjectController.getAll);
router.get("/:id", ProjectController.getById);
router.post("/", ProjectController.create);
router.patch("/:id", ProjectController.update);
router.delete("/:id", ProjectController.remove);

export default router;
