import { Request, Response } from "express";

import { MOCK_URL } from "@/api/v1/test/links.mocks";
import { HTTP_STATUS } from "@/constants/common";
import { FindAllQueryParams } from "@/repository";
import { MOCK_PRISMA_ERRORS, MOCK_RESPONSE_EXPRESS } from "@/test/mocks";
import { ApiError } from "@/utils/api-error";
import { ApiSuccessResponse } from "@/utils/api-success-response";

import { UrlController, UrlControllerImpl } from "../url.controller";
import { MOCK_SHORTEN_SERVICE, MockUrlService } from "./url.service";

describe("UrlController", () => {
  let controller: UrlController;
  let mockService: MockUrlService;
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

    it("Should call next with the error in case an error appears", async () => {
      mockService.createShortUrl.mockRejectedValue(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);

      await controller.createUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(MOCK_PRISMA_ERRORS.UNIQUE_CONSTRAINT_FAILED);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("redirectUrl", () => {
    const req = {
      params: { shortId: "valid-short-id" },
    } as Request<{ shortId: string }>;

    it("Should redirect to the long url correctly", async () => {
      mockService.findOneByShortId.mockResolvedValue(MOCK_URL);
      await controller.redirect(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith(MOCK_URL.longUrl);
    });

    it("Should call next with the error in case an error appears", async () => {
      mockService.findOneByShortId.mockRejectedValue(MOCK_PRISMA_ERRORS.RECORD_NOT_FOUND);
      await controller.redirect(req, res, next);
      expect(next).toHaveBeenCalledWith(MOCK_PRISMA_ERRORS.RECORD_NOT_FOUND);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe("getUrlsByUserId", () => {
    it("should return 200 and the urls for the user", async () => {
      const req = {
        userId: "valid-user-id",
        query: { page: "1", pageSize: "10" },
      } as unknown as Request<unknown, unknown, unknown, FindAllQueryParams>;

      const mockUrls = [MOCK_URL];
      const mockServiceResult = {
        results: mockUrls,
        meta: {
          hasNextPage: false,
          hasPrevPage: false,
          totalItems: 1,
          totalPages: 1,
          page: 1,
          pageSize: 10,
        },
      };

      mockService.findAllByUserId.mockResolvedValue(mockServiceResult);

      await controller.getUrlsByUserId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockServiceResult,
        }),
      );
    });

    it("Should call next with the error in case an error appears", async () => {
      const req = {
        userId: "valid-user-id",
      } as Request;

      mockService.findAllByUserId.mockRejectedValue(MOCK_PRISMA_ERRORS.RECORD_NOT_FOUND);

      await controller.getUrlsByUserId(req, res, next);

      expect(next).toHaveBeenCalledWith(MOCK_PRISMA_ERRORS.RECORD_NOT_FOUND);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("deleteUrl", () => {
    it("Should call next in case there is an error", async () => {
      const serviceError = new ApiError("User not found").setStatus(HTTP_STATUS.NOT_FOUND);
      mockService.deleteOneByShortId.mockRejectedValue(serviceError);

      const req = {
        userId: "none",
        params: { shortId: "any-thing" },
      } as Request<{ shortId: string }>;

      await controller.deleteUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it("It should delete the url successfully and return the deleted url", async () => {
      mockService.deleteOneByShortId.mockResolvedValue(MOCK_URL);
      const req = { userId: MOCK_URL.userId, params: { shortId: MOCK_URL.shortId } } as Request<{
        shortId: string;
      }>;

      await controller.deleteUrl(req, res, next);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: MOCK_URL,
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
