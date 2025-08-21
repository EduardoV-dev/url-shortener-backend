import { HTTP_STATUS } from "@/constants/common";
import { Url } from "@/generated/prisma";
import { FindAllQueryParams } from "@/repository";
import { ApiError } from "@/utils/api-error";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { UrlService } from "./url.service";

interface UrlController {
  /**
   * Creates a short URL from the provided long URL.
   */
  createUrl: ControllerMethod<unknown, { url: string }>;
  /**
   * Redirects to the original URL based on the short ID.
   */
  redirect: ControllerMethod<{ shortId: string }>;
  /**
   * Retrieves all URLs associated with a specific user ID.
   */
  getUrlsByUserId: ControllerMethod<unknown, unknown, FindAllQueryParams>;
}

export class UrlControllerImpl implements UrlController {
  constructor(private service: UrlService) {}

  public createUrl: UrlController["createUrl"] = async (req, res, next) => {
    try {
      const { url: urlString } = req.body;
      const url: Url = await this.service.createShortUrl(urlString, req.userId);

      res
        .status(HTTP_STATUS.CREATED)
        .json(new ApiSuccessResponse("Short url created successfully!", url).toJSON());
    } catch (err) {
      next(err);
    }
  };

  public redirect: UrlController["redirect"] = async (req, res, next) => {
    try {
      const { shortId } = req.params;
      const url: Url | null = await this.service.find(shortId);

      if (!url) throw new ApiError("URL not found").setStatus(HTTP_STATUS.NOT_FOUND);
      res.redirect(url.longUrl);
    } catch (err) {
      next(err);
    }
  };

  public getUrlsByUserId: UrlController["getUrlsByUserId"] = async (req, res, next) => {
    try {
      const urls = await this.service.findByUserId({
        userId: req.userId!,
        ...req.query,
      });

      res
        .status(HTTP_STATUS.OK)
        .json(new ApiSuccessResponse("Urls retrieved successfully", urls).toJSON());
    } catch (err) {
      next(err);
    }
  };
}
