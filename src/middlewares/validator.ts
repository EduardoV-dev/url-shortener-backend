import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

import { HTTP_STATUS } from "@/config/http-status";

type ValidationErrors = { [x in string]: string };

const groupErrors = (errors: ZodError): ValidationErrors => {
  const { fieldErrors } = errors.flatten();

  return Object.keys(fieldErrors).reduce<ValidationErrors>((errs, field) => {
    const errorMessages = fieldErrors[field];
    if (errorMessages === undefined) return { ...errs };

    return {
      ...errs,
      [field]: errorMessages.length > 0 ? errorMessages[0] : "",
    };
  }, {});
};

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response<APIResponse>, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        data: null,
        error: groupErrors(err as ZodError),
      });
    }
  };
