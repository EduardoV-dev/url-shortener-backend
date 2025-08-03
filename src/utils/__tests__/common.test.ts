import { retry } from "../common";

describe("retry", () => {
  it("resolves on first try", async () => {
    const fn = jest.fn(async () => 42);
    const result = await retry(fn, { attempts: 3 });
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries and eventually succeeds", async () => {
    let counter = 0;
    const fn = jest.fn(async () => {
      counter++;
      if (counter < 3) throw new Error("fail");
      return "success";
    });
    const result = await retry(fn, { attempts: 5, delayMs: 10 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws last error after all attempts fail", async () => {
    const fn = jest.fn(async () => {
      throw new Error("always fails");
    });
    await expect(retry(fn, { attempts: 2, delayMs: 10 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("calls onRetry callback", async () => {
    const observedAttempts: number[] = [];
    const fn = jest.fn(async () => {
      throw new Error("fail");
    });
    const onRetry = (_error: unknown, attempt: number) => {
      observedAttempts.push(attempt);
    };
    await expect(retry(fn, { attempts: 3, delayMs: 1, onRetry })).rejects.toThrow();
    expect(observedAttempts).toEqual([1, 2, 3]);
  });

  it("applies exponential backoff", async () => {
    const callTimes: number[] = [];
    const fn = jest.fn(async () => {
      callTimes.push(Date.now());
      throw new Error("fail");
    });

    await expect(retry(fn, { attempts: 3, delayMs: 20, backoff: true })).rejects.toThrow();

    // The delay between attempts should increase
    expect(callTimes.length).toBe(3);
    expect(callTimes[1] - callTimes[0]).toBeGreaterThanOrEqual(20);
    expect(callTimes[2] - callTimes[1]).toBeGreaterThanOrEqual(40);
  });
});
