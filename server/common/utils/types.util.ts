import { NextFunction, Request, Response } from "express";

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

export const isAuthenticatedRequest = (req: Request): req is AuthenticatedRequest => {
  return "user" in req && !!req.user;
};

// Basic controller type
export type Controller = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

// Controller with typed body
export type BodyController<T> = (
  req: Request<Record<string, never>, unknown, T>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Controller with typed params
export type ParamsController<T extends Record<string, string>> = (
  req: Request<T>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Controller with typed body + params
export type BodyParamsController<
  TBody,
  TParams extends Record<string, string> = Record<string, string>,
> = (
  req: Request<TParams, object, TBody>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Controller with typed query
export type QueryController<T> = (
  req: Request<object, object, object, T>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Middleware
export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
