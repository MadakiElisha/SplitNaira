import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: "not_found",
    message: "Route not found."
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res.status(500).json({
    error: "internal_error",
    message: "Unexpected server error."
  });
}
