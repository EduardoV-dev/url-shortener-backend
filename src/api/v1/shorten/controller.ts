import { HTTP_STATUS } from "@/config/common";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";
import { HttpError } from "@/utils/http-error";
import { logger } from "@/utils/logger";

import { Service } from "./service";

interface Controller {
  createUrl: ControllerMethod<unknown, { url: string }>;
}

export class UrlShortenerController implements Controller {
  constructor(private service: Service) {}

  public createUrl: Controller["createUrl"] = async (req, res) => {
    try {
      const { url: urlString } = req.body;
      const url = await this.service.createShortUrl(urlString);

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("Short url created successfully!", url).toJSON());
    } catch (err) {
      const error = err as HttpError;
      logger.error("[Controller] createUrl", error);

      res
        .status(error.statusCode)
        .json(new ApiErrorResponse("Failed to create short URL", error).toJSON());
    }
  };
}
