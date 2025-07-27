import { Request, Response } from "express";
import { UrlShortenerController } from "../controller";
import { Service } from "../service";
import { HttpError } from "@/utils/http-error";
import { mockUrl } from "./mocks";

describe("UrlShortenerController", () => {
  let controller: UrlShortenerController;
  let mockService: jest.Mocked<Service>;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      createShortUrl: jest.fn(),
      getUrl: jest.fn(),
      deleteUrl: jest.fn(),
      updateUrl: jest.fn(),
      updateClickCount: jest.fn(),
    };

    controller = new UrlShortenerController(mockService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Response>;
  });

  describe("createUrl", () => {
    it("should return 201 and the short url on success", async () => {
      const req = { body: { url: "https://example.com" } } as Request;
      mockService.createShortUrl.mockResolvedValue(mockUrl);

      await controller.createUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should return 500 and error message on failure", async () => {
      const req = { body: { url: "https://example.com" } } as Request;
      const error = new HttpError("Could not create url", 500);

      mockService.createShortUrl.mockRejectedValue(error);

      await controller.createUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUrl", () => {
    const req = { params: { shortCode: "asdfas" } } as Request<{
      shortCode: string;
    }>;

    it("should return 200 status code and the url on success", async () => {
      mockService.updateClickCount.mockResolvedValue({
        ...mockUrl,
        clickCount: 1,
      });

      await controller.getUrlByShortCode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if url not found", async () => {
      mockService.updateClickCount.mockRejectedValue(new HttpError("Url not found", 404));

      await controller.getUrlByShortCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on service error", async () => {
      mockService.updateClickCount.mockRejectedValue(new HttpError("Service error", 500));

      await controller.getUrlByShortCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteUrl", () => {
    const req = { params: { shortCode: "asdfas" } } as Request<{
      shortCode: string;
    }>;

    it("should return 200 on successful delete", async () => {
      mockService.deleteUrl.mockResolvedValue(mockUrl);

      await controller.deleteUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should return 404 if url not found for delete", async () => {
      mockService.deleteUrl.mockRejectedValue(new HttpError("Url not found", 404));

      await controller.deleteUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on service error during delete", async () => {
      const error = new HttpError("Service error", 500);
      mockService.deleteUrl.mockRejectedValue(error);

      await controller.deleteUrl(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });
});
