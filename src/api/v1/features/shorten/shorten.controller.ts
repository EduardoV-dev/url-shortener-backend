import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { ApiError } from "@/utils/api-error";
import { ApiErrorResponse } from "@/utils/api-error-response";
import { ApiSuccessResponse } from "@/utils/api-success-response";
import { logger } from "@/utils/logger";

import { ShortenService } from "./shorten.service";

interface ShortenController {
  createUrl: ControllerMethod<{ url: string }>;
}

export class ShortenControllerImpl implements ShortenController {
  constructor(private service: ShortenService) {}

  public createUrl: ShortenController["createUrl"] = async (req, res) => {
    try {
      const { url: urlString } = req.body;
      const url: Url = await this.service.createShortUrl(urlString);

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("Short url created successfully!", url).toJSON());
    } catch (err) {
      const error = err as ApiError;
      logger.error("UrlShortenerController | createUrl", error);
      res.status(error.status).json(new ApiErrorResponse(error.message, error).toJSON());
    }
  };
}
