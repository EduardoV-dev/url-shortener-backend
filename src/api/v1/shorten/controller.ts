import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";
import { retry } from "@/utils/common";
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
      const url: Url = await retry(() => this.service.createShortUrl(urlString), {
        onRetry: (error, attempt) =>
          logger.warn(`UrlShortenerController.createUrl | Attempt ${attempt} failed:`, error),
      });

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("Short url created successfully!", url).toJSON());
    } catch (err) {
      const error = err as ApiError;
      logger.error("UrlShortenerController | createUrl", error);
      res.status(error.status).json(new ApiErrorResponse(error.message).toJSON());
    }
  };
}
