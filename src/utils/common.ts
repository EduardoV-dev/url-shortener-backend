/**
 * A robust retry utility for async operations.
 * - Supports configurable attempts and delay.
 * - Handles error propagation and preserves error context.
 * - Accepts an optional onRetry callback for logging or side effects.
 * - Optionally supports exponential backoff.
 *
 * @param fn        The async function to retry.
 * @param options   Configuration options:
 *    attempts:     Number of attempts (default: 3)
 *    delayMs:      Delay between attempts in ms (default: 500)
 *    backoff:      If true, multiplies delay by attempt number (default: false)
 *    onRetry:      Optional callback on each retry: (error, attempt) => void
 * @returns         The resolved value or throws the last error.
 * @example
 * ```typescript
 * import { retry } from './utils/common';
 * async function fetchData() {
 *   return await retry(() => fetch('https://api.example.com/data'), {
 *     attempts: 5,
 *     delayMs: 1000,
 *     backoff: true,
 *     onRetry: (error, attempt) => {
 *       console.warn(`Attempt ${attempt} failed:`, error);
 *     },
 *  });
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options?: {
    attempts?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (error: unknown, attempt: number) => void;
  },
): Promise<T> {
  const attempts = options?.attempts ?? 3;
  const delayMs = options?.delayMs ?? 500;
  const backoff = options?.backoff ?? false;
  const onRetry = options?.onRetry;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (onRetry) onRetry(error, attempt);

      if (attempt < attempts) {
        const actualDelay = backoff ? delayMs * attempt : delayMs;
        await new Promise((res) => setTimeout(res, actualDelay));
      }
    }
  }

  throw lastError;
}
