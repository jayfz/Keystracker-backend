import Express from "express";
import * as CLIParametersController from "../controllers/CLIParametersController.js";
const router = Express.Router();

// router.get("/", ProjectController.getAll);
// router.get("/:id", CLIParametersController.create);
router.post("/", CLIParametersController.create);
router.patch("/:id", CLIParametersController.update);
router.delete("/:id", CLIParametersController.remove);

export default router;
