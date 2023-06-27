import * as dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // await prisma.project.create({
  //   data: {
  //     url: "https://youtube.com2",
  //     parameters: {
  //       create: { updatedAt: new Date().toISOString() },
  //     },
  //   },
  // });

  const allProjects = await prisma.project.findMany({
    include: {
      parameters: true,
    },
  });

  return allProjects;
}

const app = express();
const port = process.env.PORT;
const corsOptions = {
  origin: "*",
  methods: "GET,POST,PATCH",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.get("/", function (reqw, res) {
  res.send("Hello World!!");
  main()
    .then(async (allProjects) => {
      console.log(allProjects);
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});

app.listen(port);
