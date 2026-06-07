import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/error.util";
import { logger } from "../config/logger.config";

export const errorHandlerMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  logger.error(`[${req.method}] ${req.path} - ${err.message}`);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
