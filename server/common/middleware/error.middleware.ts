import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/error.util";

export const errorHandlerMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    console.error(`[${req.method}] ${req.path} - ${err.message}`);

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  console.error(`[${req.method}] ${req.path} - ${err.message}`);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
