import { logger } from "../logger";

jest.mock("winston", () => {
  const actualWinston = jest.requireActual("winston");
  return {
    ...actualWinston,
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
    })),
  };
});

describe("logger", () => {
  it("should be defined", () => {
    expect(logger).toBeDefined();
  });

  it("should log info messages", () => {
    logger.info("test info");
    expect(logger.info).toHaveBeenCalledWith("test info");
  });

  it("should log error messages", () => {
    logger.error("test error");
    expect(logger.error).toHaveBeenCalledWith("test error");
  });

  it("should log with splat", () => {
    logger.info("test %s", "splat");
    expect(logger.info).toHaveBeenCalledWith("test %s", "splat");
  });
});
