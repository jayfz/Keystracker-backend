import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import "express-async-errors";
import bodyParser from "body-parser";
import cors from "cors";

import ProjectRouter from "./routes/ProjectRouter.js";
import CLIParametersRouter from "./routes/CLIParametersRouter.js";
import { ErrorController } from "./controllers/ErrorController.js";
import { needsApplicationJSONHeader } from "./controllers/common.js";

dotenv.config();

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
app.use(ErrorController);

app.listen(port);
