import { Request, Response } from "express";
import { UrlShortenerController } from "../controller";
import { Service } from "../service";
import { HttpError } from "@/utils/http-error";
import { Url } from "@/generated/prisma";

describe("UrlShortenerController", () => {
  let controller: UrlShortenerController;
  let mockService: jest.Mocked<Service>;
  let res: jest.Mocked<Response>;

  beforeEach(() => {
    mockService = {
      createShortUrl: jest.fn(),
      getUrl: jest.fn(),
      deleteUrl: jest.fn(),
    } as jest.Mocked<Service>;

    controller = new UrlShortenerController(mockService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Response>;

    jest.clearAllMocks();
  });

  describe("createUrl", () => {
    it("should return 201 and the short url on success", async () => {
      const req = { body: { url: "https://example.com" } } as Request;
      const shortUrl: Url = {
        id: 1,
        shortCode: "asdfas",
        originalUrl: "https://example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0,
      };
      mockService.createShortUrl.mockResolvedValue(shortUrl);

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
});
