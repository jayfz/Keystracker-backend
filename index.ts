import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import cors from "cors";

import ProjectRouter from "./routes/ProjectRouter.js";
import CLIParametersRouter from "./routes/CLIParametersRouter.js";
import { ErrorController } from "./controllers/ErrorController.js";
import { needsApplicationJSONHeader } from "./controllers/common.js";
import { setupWebSocketServer } from "./integrations/WebsocketIntegration.js";
import path from "node:path";
import os from "node:os";

dotenv.config();

const imageDir = path.join(os.homedir(), "Downloads/KeystrackerProjects");

const app = express();
const port = process.env.PORT;
const corsOptions = {
  origin: "*",
  methods: "GET,POST,PATCH,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(needsApplicationJSONHeader);
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/", function (request: Request, response: Response) {
  response.send("Hello World!!");
});
app.use("/api/projects", ProjectRouter);
app.use("/api/cli-parameters", CLIParametersRouter);
app.use("/public", express.static(imageDir, { dotfiles: "deny" }));

app.use(ErrorController);

const expressServer = app.listen(port);
setupWebSocketServer(expressServer);
