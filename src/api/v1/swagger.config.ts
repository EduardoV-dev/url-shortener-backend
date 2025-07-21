import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  openapi: "3.1.0",
  info: {
    title: "Url Shortener API",
    version: "1.0.0",
    description:
      "API Documentation for Url Shortener Service, provides endpoints to create, retrieve, update and delete short URLs.",
    license: {
      name: "MIT",
      url: "https://opensource.org/license/mit/",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
    },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates if the request was successful",
          },
          message: {
            type: "string",
            description: "Message describing the result of the request",
          },
          data: {
            type: "object",
            nullable: true,
            description: "Payload for successful response",
          },
          error: {
            type: "object",
            nullable: true,
            description: "Error details for failed response",
          },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ["./src/api/v1/**/routes.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
