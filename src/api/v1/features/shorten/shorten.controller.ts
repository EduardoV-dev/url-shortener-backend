import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { ShortenService } from "./shorten.service";

interface ShortenController {
  createUrl: ControllerMethod<unknown, { url: string }>;
}

export class ShortenControllerImpl implements ShortenController {
  constructor(private service: ShortenService) {}

  public createUrl: ShortenController["createUrl"] = async (req, res, next) => {
    try {
      const { url: urlString } = req.body;
      const url: Url = await this.service.createShortUrl(urlString);

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("Short url created successfully!", url).toJSON());
    } catch (err) {
      next(err);
    }
  };
}
