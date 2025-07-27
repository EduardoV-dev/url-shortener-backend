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
      const { url: urlString } = req.body;
      const url = await this.service.createShortUrl(urlString);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Short url created successfully!",
        data: url,
        error: null,
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error("[Controller] createUrl", error);

      res.status(error.statusCode).json({
        success: false,
        data: null,
        error: { message: error.message, data: null },
        message: "",
      });
    }
  };

  public getUrlByShortCode: Controller["getUrlByShortCode"] = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const url = await this.service.updateClickCount(shortCode);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: url,
        error: null,
        message: "Url retrieved successfully!",
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error("[Controller] getUrlByShortCode", error);

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
      const url = await this.service.deleteUrl(shortCode);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: url,
        error: null,
        message: "Url deleted successfully!",
      });
    } catch (err) {
      const error = err as HttpError;
      logger.error("[Controller] deleteUrl", error);

      res.status(error.statusCode).json({
        success: false,
        data: null,
        error: error.details,
        message: error.message,
      });
    }
  };
}
