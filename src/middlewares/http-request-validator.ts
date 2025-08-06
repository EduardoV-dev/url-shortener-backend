import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";

import { HTTP_STATUS } from "@/constants/common";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { logger } from "@/utils/logger";

type ValidationErrors = { [x in string]: string };

/**
 * Middleware to validate HTTP request bodies against a Zod schema.
 * This middleware will parse the request body and validate it against the provided Zod schema.
 * If validation fails, it will respond with a 400 Bad Request status and an error message
 * and the validation errors.
 * @property {AnyZodObject} schema - The Zod schema to validate the request body against.
 * @method validate - Express middleware function that validates the request body.
 *
 * @example
 * import { z } from "zod";
 * import { HttpRequestValidator } from "@/middlewares/http-request-validator";
 *
 * const schema = z.object({
 *   name: z.string().min(1, "Name is required"),
 * })
 *
 * app.post("/endpoint", new HttpRequestValidator(schema).validate, (req, res) => {
 */
export class HttpRequestValidator {
  constructor(private schema: ZodTypeAny) {}

  /**
   * Validates the request body against the Zod schema.
   * If validation fails, it responds with a 400 Bad Request status and an error message
   * and the validation errors.
   * @param {Request} req - The Express request object containing the body to validate.
   * @param {Response} res - The Express response object to send the validation result.
   * @param {NextFunction} next - The next middleware function in the Express pipeline.
   * @throws {ApiErrorResponse} - If validation fails, an ApiErrorResponse is sent with a 400 status code
   * and a message indicating validation failure along with the grouped errors.
   */
  public validate = async (req: Request, res: Response<APIResponse>, next: NextFunction) => {
    try {
      this.schema.parse(req.body);
      next();
    } catch (err) {
      const errors = this.groupErrors(err as ZodError);
      logger.error(`Validation failed for [${req.method}]: ${req.originalUrl}`, errors);

      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(new ApiErrorResponse("Validation failed", errors).toJSON());
    }
  };

  /**
   * AVAILABLE FOR TESTING PURPOSES (COVERAGE).
   * Groups Zod validation errors into a more readable format.
   *
   * @param {ZodError} errors - The ZodError object containing validation errors.
   * @returns {ValidationErrors} - An object where keys are field names and error message
   */
  public groupErrors = (errors: ZodError): ValidationErrors => {
    const { fieldErrors } = errors.flatten();

    return Object.keys(fieldErrors).reduce<ValidationErrors>((errs, field) => {
      const errors: string[] = fieldErrors[field] || [""];
      if (errors[0] === "") return errs;
      return { ...errs, [field]: errors[0] };
    }, {});
  };
}
