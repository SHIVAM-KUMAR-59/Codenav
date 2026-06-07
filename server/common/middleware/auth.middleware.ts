import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "../utils/error.util";
import { logger } from "../config/logger.config";
import type { Middleware, AuthenticatedRequest } from "../utils/types.util";

type AccessTokenPayload = {
  userId: string;
  email: string;
};

export const authenticate: Middleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET) as AccessTokenPayload;

    logger.debug(`Authenticated user: ${decoded.email} (ID: ${decoded.userId})`);

    (req as AuthenticatedRequest).user = decoded;

    next();
  } catch {
    logger.error("Invalid token");
    next(new ApiError("Unauthorized", 401, "UNAUTHORIZED"));
  }
};
