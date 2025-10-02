import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body ?? {},
        query: req.query ?? {},
        params: req.params ?? {},
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        //@ts-ignore
        const details = error.errors?.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
          message: err.message,
        })) || []; // fallback to empty array if errors is undefined

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details,
        });
        return;
      }
      next(error);
    }
  };
};
