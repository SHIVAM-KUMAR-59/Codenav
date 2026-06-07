import express from "express";
import { env } from "./common/config/env.config";
import { logger } from "./common/config/logger.config";

const app = express();

app.listen(env.PORT, () => {
  logger.debug(`Server is running on port ${env.PORT}`);
});
