import { Request, Response } from "express";

import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { MOCK_PRISMA_ERRORS, MOCK_RESPONSE_EXPRESS } from "@/test/mocks";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { UrlControllerImpl } from "../url.controller";
import { MOCK_SHORTEN_SERVICE, MockShortenService } from "./url.service";

describe("UrlShortenerController", () => {
  let controller: UrlControllerImpl;
  let mockService: MockShortenService;
  let res: jest.Mocked<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = MOCK_SHORTEN_SERVICE;
    controller = new UrlControllerImpl(mockService);
    res = MOCK_RESPONSE_EXPRESS;
    next = jest.fn();
  });

  describe("createUrl", () => {
    const req = {
      body: { url: "https://example.com" },
      userId: "valid-user-id",
    } as Request;

    it("should return 201 and the short url on success", async () => {
      mockService.createShortUrl.mockResolvedValue(MOCK_URL);

      await controller.createUrl(req, res, next);

      const response = new ApiSuccessResponse("", MOCK_URL).toJSON();
      const { data, success } = response;

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success,
          data,
        }),
      );
    });

    it("Should return 409 if shortId is already taken", async () => {
      mockService.createShortUrl.mockRejectedValue(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);

      await controller.createUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 500 and error message on failure", async () => {
      const error = new Error("Internal Server Error");
      mockService.createShortUrl.mockRejectedValue(error);

      await controller.createUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
