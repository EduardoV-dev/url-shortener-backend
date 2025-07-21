import { logger } from "@/utils/logger";
import { Service } from "./service";
import { HttpError } from "@/utils/http-error";
import { HTTP_STATUS } from "@/config/http-status";

interface Controller {
  createUrl: ControllerMethod<{}, { url: string }>;
  getUrlByShortCode: ControllerMethod<{ shortCode: string }>;
  deleteUrl: ControllerMethod<{ shortCode: string }>;
}

export class UrlShortenerController implements Controller {
  constructor(private service: Service) {}

  public createUrl: Controller["createUrl"] = async (req, res) => {
    try {
      const { url } = req.body;
      const response = await this.service.createShortUrl(url);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Short url created successfully!",
        data: response,
        error: null,
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error(`Error creating short URL: ${{ error }}`);

      res.status(error.statusCode).json({
        success: false,
        data: null,
        error: { message: error.message, data: null },
        message: "",
      });
    }
  };

  public getUrlByShortCode: Controller["getUrlByShortCode"] = async (
    req,
    res,
  ) => {
    try {
      const { shortCode } = req.params;
      const response = await this.service.getUrl(shortCode);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response,
        error: null,
        message: "Url retrieved successfully!",
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error(`Error retrieving URL: ${{ error }}`);

      res.status(error.statusCode).json({
        success: false,
        data: null,
        error: error.details,
        message: error.message,
      });
    }
  };

  public deleteUrl: Controller["deleteUrl"] = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const response = await this.service.deleteUrl(shortCode);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response,
        error: null,
        message: "Url deleted successfully!",
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error(`error: ${{ error }}`);

      res.status(error.statusCode).json({
        success: false,
        data: null,
        error: error.details,
        message: error.message,
      });
    }
  };
}
