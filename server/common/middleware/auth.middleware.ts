import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "../utils/error.util";
import { logger } from "../config/logger.config";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as {
      userId: string;
      email: string;
    };

    logger.debug(`Authenticated user: ${decoded.email} (ID: ${decoded.userId})`);
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch {
    logger.error("Invalid token");
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }
};
