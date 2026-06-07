import express from "express";
import { env } from "./common/config/env.config";
import { logger } from "./common/config/logger.config";
import apiRouter from "./modules/index";
import cors from "cors";
import { errorHandlerMiddleware } from "./common/middleware/error.middleware";
import { requestLoggerMiddleware } from "./common/middleware/requestLogger.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use(requestLoggerMiddleware);
app.use(apiRouter);
app.use(errorHandlerMiddleware);

app.listen(env.PORT, () => {
  logger.debug(`Server is running on port ${env.PORT}`);
});
