import { Service } from "./service";
import { Url } from "@/generated/prisma";
import { HttpError } from "@/utils/http-error";

type UrlResponse = APIResponse<Url>;

interface Controller {
  createUrl: ControllerMethod<{}, UrlResponse, { url: string }>;
  getUrlByShortCode: ControllerMethod<{ shortCode: string }, UrlResponse>;
  deleteUrl: ControllerMethod<{ shortCode: string }, UrlResponse>;
}

export class UrlShortenerController implements Controller {
  constructor(private service: Service) {}

  public createUrl: Controller["createUrl"] = async (req, res) => {
    try {
      const { url } = req.body;
      const response = await this.service.createShortUrl(url);

      res.status(201).json({
        message: "Short url created successfully!",
        data: response,
        error: null,
      });
    } catch (err) {
      const error = err as HttpError;
      console.log("error", error.details, error.message);
      res.status(error.statusCode).json({
        data: null,
        error: { message: error.message, data: null },
        message: "",
      });
    }
  };

  public getUrlByShortCode: Controller["getUrlByShortCode"] = async (
    req,
    res,
  ) => {
    try {
      const { shortCode } = req.params;
      const response = await this.service.getUrl(shortCode);

      res.status(200).json({
        data: response,
        error: null,
        message: "Url retrieved successfully!",
      });
    } catch (err) {
      const error = err as HttpError;
      console.log("error", error.details, error.message);

      res.status(error.statusCode).json({
        data: null,
        error: { message: error.message, data: error.details || null },
        message: "",
      });
    }
  };

  public deleteUrl: Controller["deleteUrl"] = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const response = await this.service.deleteUrl(shortCode);

      res.status(200).json({
        data: response,
        error: null,
        message: "Url deleted successfully!",
      });
    } catch (err) {
      const error = err as HttpError;

      console.log("error", error.details, error.message);
      res.status(error.statusCode).json({
        data: null,
        error: { message: error.message, data: error.details || null },
        message: "",
      });
    }
  };
}
