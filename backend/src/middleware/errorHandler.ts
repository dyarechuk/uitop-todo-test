import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { isDevelopment } from '../config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
}
