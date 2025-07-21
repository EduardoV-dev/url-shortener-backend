import { Router } from "express";
import { UrlShortenerController } from "./controller";
import { validateRequest } from "@/middlewares/validator";
import { urlSchema } from "./validations";
import { UrlShortenerRepository } from "./repository";
import { UrlShortenerService } from "./service";
import { ShortCodeGenerator } from "./utils";

const repo = new UrlShortenerRepository();
const shortCodeGenerator = new ShortCodeGenerator();
const service = new UrlShortenerService(repo, shortCodeGenerator);
const controller = new UrlShortenerController(service);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Url:
 *       type: object
 *       properties:
 *         clickCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         id:
 *           type: integer
 *         originalUrl:
 *           type: string
 *           format: uri
 *         shortCode:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UrlResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Url'
 */
router
  /**
   * @openapi
   * /shorten/{short-code}:
   *   get:
   *     tags:
   *       - shorten
   *     summary: Get a shortened URL by its short code
   *     description: Retrieve the original URL associated with a given short code.
   *     parameters:
   *       - in: path
   *         name: short-code
   *         required: true
   *         description: The short code of the URL to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully retrieved the original URL
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UrlResponse'
   *       404:
   *         description: URL not found
   *       500:
   *         description: Internal server error
   *
   */
  .get("/:shortCode", controller.getUrlByShortCode)
  /**
   * @openapi
   * /shorten:
   *   post:
   *     tags:
   *       - shorten
   *     summary: Create a new shortened URL
   *     description: Create a new shortened URL by providing the original URL.
   *     requestBody:
   *       description: Create a new shortened URL
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               url:
   *                 type: string
   *                 format: uri
   *       required: true
   *     responses:
   *       201:
   *         description: Successfully created the shortened URL
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UrlResponse'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  .post("", validateRequest(urlSchema), controller.createUrl)
  /**
   * @openapi
   * /shorten/{short-code}:
   *   delete:
   *     tags:
   *       - shorten
   *     summary: Delete a shortened URL by its short code
   *     parameters:
   *       - in: path
   *         name: short-code
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Successfully deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UrlResponse'
   *       404:
   *         description: URL to delete not found
   *       500:
   *         description: Internal server error
   */
  .delete("/:shortCode", controller.deleteUrl);

export default router;
