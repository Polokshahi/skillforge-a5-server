import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);

    // Express 5: req.query and req.params are getter-based/read-only.
    // So only mutate req.body directly; keep query/params in res.locals.
    if (source === "body") {
      req.body = parsed;
    } else {
      res.locals.validated = {
        ...(res.locals.validated ?? {}),
        [source]: parsed,
      };
    }

    next();
  };