import { Request, Response } from "express";

import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { MOCK_RESPONSE_EXPRESS } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { ShortenControllerImpl } from "../shorten.controller";
import { MOCK_SHORTEN_SERVICE, MockShortenService } from "./shorten.service";

describe("UrlShortenerController", () => {
  let controller: ShortenControllerImpl;
  let mockService: MockShortenService;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = MOCK_SHORTEN_SERVICE;
    controller = new ShortenControllerImpl(mockService);
    res = MOCK_RESPONSE_EXPRESS;
  });

  describe("createUrl", () => {
    it("should return 201 and the short url on success", async () => {
      const req = { body: { url: "https://example.com" } } as Request;
      mockService.createShortUrl.mockResolvedValue(MOCK_URL);

      await controller.createUrl(req, res);

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
      const req = { body: { url: "https://example.com" } } as Request;
      mockService.createShortUrl.mockRejectedValue(
        new ApiError("Short ID already taken").setStatus(HTTP_STATUS.CONFLICT),
      );

      await controller.createUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: "Short ID already taken" }),
      );
    });

    it("should return 500 and error message on failure", async () => {
      const req = { body: { url: "https://example.com" } } as Request;
      mockService.createShortUrl.mockRejectedValue(
        new ApiError("Could not create url").setStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR),
      );

      await controller.createUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
