export interface Retry {
  execute: <T>(fn: () => Promise<T>) => Promise<T>;
  getConfig: () => {
    attempts: number;
    backoff: boolean;
    delayMs: number;
    onRetry: RetryFn<void>;
    shouldRetry: RetryFn<boolean>;
  };
  setAttempts: (attempts: number) => this;
  setBackoff: (backoff: boolean) => this;
  setDelayMs: (delayMs: number) => this;
  setOnRetry: (onRetry: RetryFn<void>) => this;
  setShouldRetry: (shouldRetry: RetryFn<boolean>) => this;
}

/**
 * A class-based retry utility for async operations.
 * - Provides a fluent API for configuration.
 *   Supports configurable attempts and delay.
 *   - Handles error propagation and preserves error context.
 *   - Accepts an optional onRetry callback for logging or side effects.
 *   - Optionally supports exponential backoff.
 *   @example
 *   ```typescript
 *   import { Retry } from './utils/common';
 *
 *   const retry = new Retry()
 *     .setAttempts(5)
 *     .setDelayMs(1000)
 *     .setBackoff(true)
 *     .setShouldRetry((error) => {
 *        // Retry only on specific error types
 *        return error instanceof NetworkError || error instanceof TimeoutError;
 *     })
 *     .setOnRetry((error, attempt) => {
 *       console.warn(`Attempt ${attempt} failed:`, error);
 *     });
 *
 *   async function fetchData() {
 *     return await retry.execute(() => fetch('https://api.example.com/data'));
 *   }
 *   ```
 */
export class RetryImpl implements Retry {
  private attempts: number;
  private delayMs: number;
  private backoff: boolean;
  private onRetry: RetryFn<void>;
  private shouldRetry: RetryFn<boolean>;

  constructor() {
    this.attempts = DEFAULT_ATTEMPTS;
    this.delayMs = DEFAULT_DELAY_MS;
    this.backoff = DEFAULT_BACKOFF;
    this.onRetry = () => {};
    this.shouldRetry = () => true; // Default to always retry
  }

  public setAttempts(attempts: number): this {
    this.attempts = attempts;
    return this;
  }

  public setDelayMs(delayMs: number): this {
    this.delayMs = delayMs;
    return this;
  }

  public setBackoff(backoff: boolean): this {
    this.backoff = backoff;
    return this;
  }

  public setOnRetry(onRetry: RetryFn<void>): this {
    this.onRetry = onRetry;
    return this;
  }

  public setShouldRetry(shouldRetry: RetryFn<boolean>): this {
    this.shouldRetry = shouldRetry;
    return this;
  }

  public getConfig() {
    return {
      attempts: this.attempts,
      backoff: this.backoff,
      delayMs: this.delayMs,
      onRetry: this.onRetry,
      shouldRetry: this.shouldRetry,
    };
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.attempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt)) throw lastError;
        this.onRetry(error, attempt);
        if (attempt >= this.attempts) throw lastError;

        const actualDelay = this.backoff ? this.delayMs * attempt : this.delayMs;
        await new Promise((res) => setTimeout(res, actualDelay));
      }
    }

    throw lastError;
  }
}

type RetryFn<T> = (error: unknown, attempt: number) => T;

export const DEFAULT_ATTEMPTS = 3;
export const DEFAULT_DELAY_MS = 500;
export const DEFAULT_BACKOFF = false;
