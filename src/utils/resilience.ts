import {
  circuitBreaker,
  retry,
  handleAll,
  ExponentialBackoff,
  ConsecutiveBreaker,
  CircuitBreakerPolicy,
  RetryPolicy,
} from 'cockatiel';

/**
 * Creates a reusable retry policy with exponential backoff.
 *
 * @param maxAttempts The maximum number of retry attempts.
 * @param initialDelay The initial delay in milliseconds for the retry.
 * @param maxDelay The maximum delay in milliseconds for the retry.
 * @returns {RetryPolicy} A retry policy that can be used across services.
 */
export function createRetryPolicy(
  maxAttempts: number,
  initialDelay: number = 1000,
  maxDelay: number = 10000
): RetryPolicy {
  return retry(handleAll, {
    backoff: new ExponentialBackoff({
      initialDelay,
      maxDelay,
    }),
    maxAttempts,
  });
}

/**
 * Creates a reusable circuit breaker policy with exponential backoff for half-open state.
 *
 * @param failureThreshold The number of consecutive failures before breaking the circuit.
 * @param initialDelay The initial delay in milliseconds before the circuit attempts to half-open.
 * @param maxDelay The maximum delay in milliseconds before retrying after the circuit is half-open.
 * @returns {CircuitBreakerPolicy} A circuit breaker policy that can be used across services.
 */
export function createCircuitBreakerPolicy(
  failureThreshold: number,
  initialDelay: number = 1000,
  maxDelay: number = 10000
): CircuitBreakerPolicy {
  return circuitBreaker(handleAll, {
    halfOpenAfter: new ExponentialBackoff({
      initialDelay,
      maxDelay,
    }),
    breaker: new ConsecutiveBreaker(failureThreshold),
  });
}
