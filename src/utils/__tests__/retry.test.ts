import { DEFAULT_ATTEMPTS, DEFAULT_BACKOFF, DEFAULT_DELAY_MS, RetryImpl } from "../retry";

jest.unmock("@/utils/retry");

describe("Retry", () => {
  let onRetry: jest.Mock;
  let shouldRetry: jest.Mock;
  let retry: RetryImpl;

  beforeEach(() => {
    jest.clearAllMocks();

    onRetry = jest.fn();
    shouldRetry = jest.fn().mockReturnValue(true);

    retry = new RetryImpl().setDelayMs(0);
  });

  it("Creates retry with default values", () => {
    const retry = new RetryImpl().getConfig();

    expect(retry.attempts).toBe(DEFAULT_ATTEMPTS);
    expect(retry.backoff).toBe(DEFAULT_BACKOFF);
    expect(retry.delayMs).toBe(DEFAULT_DELAY_MS);
    expect(retry.onRetry).toBeInstanceOf(Function);
    expect(retry.shouldRetry).toBeInstanceOf(Function);
  });

  it("Sets custom values", () => {
    const config = retry
      .setAttempts(5)
      .setBackoff(true)
      .setDelayMs(1000)
      .setOnRetry(onRetry)
      .setShouldRetry(shouldRetry)
      .getConfig();

    expect(config.attempts).toBe(5);
    expect(config.backoff).toBe(true);
    expect(config.delayMs).toBe(1000);
    expect(config.onRetry).toBe(onRetry);
    expect(config.shouldRetry).toBe(shouldRetry);
  });

  it("Successfully executes a function without retries", async () => {
    const successFn = jest.fn().mockResolvedValue("success");

    const result = await retry.execute(successFn);
    expect(result).toBe("success");
    expect(successFn).toHaveBeenCalledTimes(1);
  });

  it("Retries a function until it succeeds", async () => {
    const retriesFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failure"))
      .mockRejectedValueOnce(new Error("failure"))
      .mockResolvedValueOnce("success");

    const result = await retry.execute(retriesFn);

    expect(result).toBe("success");
    expect(retriesFn).toHaveBeenCalledTimes(3);
  });

  it("retries a function until it fails", async () => {
    const retriesFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failure"))
      .mockRejectedValueOnce(new Error("failure"))
      .mockRejectedValueOnce(new Error("failure"));

    await expect(retry.execute(retriesFn)).rejects.toThrow("failure");
    expect(retriesFn).toHaveBeenCalledTimes(3);
  });

  it("Not execute retries if shouldRetry returns false", async () => {
    const retriesFn = jest.fn().mockRejectedValueOnce(new Error("failure"));
    retry.setShouldRetry(() => false);
    await expect(retry.execute(retriesFn)).rejects.toThrow("failure");
    expect(retriesFn).toHaveBeenCalledTimes(1);
  });

  it("Executes onRetry callback on each retry", async () => {
    const retriesFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failure"))
      .mockRejectedValueOnce(new Error("failure"))
      .mockResolvedValueOnce("success");

    await retry.setOnRetry(onRetry).execute(retriesFn);

    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("Sets delay with backoff correctly", async () => {
    jest.useFakeTimers();

    const retriesFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failure"))
      .mockRejectedValueOnce(new Error("failure"))
      .mockResolvedValueOnce("success");

    const retryWithBackoff = retry.setDelayMs(2).setBackoff(true).setOnRetry(onRetry);
    const executePromise = retryWithBackoff.execute(retriesFn);

    expect(retriesFn).toHaveBeenCalledTimes(1);

    // First retry after 4ms (delayMs * attempt = 2 * 2)
    jest.advanceTimersByTime(4);
    await jest.runOnlyPendingTimersAsync();
    expect(retriesFn).toHaveBeenCalledTimes(2);

    // Second retry after 6ms (delayMs * attempt = 2 * 3)
    jest.advanceTimersByTime(6);
    await jest.runOnlyPendingTimersAsync();
    expect(retriesFn).toHaveBeenCalledTimes(3);

    await executePromise;
    expect(onRetry).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
