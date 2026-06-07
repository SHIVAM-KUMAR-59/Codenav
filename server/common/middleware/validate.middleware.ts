import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/error.util";

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(", ");
      return next(new ValidationError(message));
    }

    req.body = result.data;
    next();
  };
};
