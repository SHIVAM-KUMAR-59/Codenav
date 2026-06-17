import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "../../modules/index";
import { errorHandlerMiddleware } from "../../common/middleware/error.middleware";

export function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(apiRouter);
  app.use(errorHandlerMiddleware);
  return app;
}
