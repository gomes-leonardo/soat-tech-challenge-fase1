import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Rate Limit Store Port — abstraction for rate limit state storage.
 * This allows swapping between in-memory (dev) and Redis (prod) implementations.
 */
export abstract class RateLimitStore {
  /**
   * Records a hit for the given key and returns the current count
   * and the time (in seconds) until the current window resets.
   */
  abstract hit(key: string): Promise<{ count: number; resetInSeconds: number }>;

  /**
   * Returns the current count and reset time for a key without incrementing.
   */
  abstract get(key: string): Promise<{ count: number; resetInSeconds: number } | null>;
}

/**
 * In-Memory Rate Limit Store — stores rate limit state in a Map.
 *
 * // TODO(optional): swap this for a Redis-backed implementation behind
 * the same RateLimitStore port for production scalability.
 */
@Injectable()
export class InMemoryRateLimitStore extends RateLimitStore {
  // TODO(you): implement the internal data structure.
  // You'll need to track: key → { count, windowStart }
  // Consider using a Map<string, { count: number; windowStart: number }>

  constructor(
    private readonly maxRequests: number = 10,
    private readonly windowMs: number = 60_000,
  ) {
    super();
  }

  async hit(_key: string): Promise<{ count: number; resetInSeconds: number }> {
    // TODO(you): implement fixed-window OR sliding-window rate limiting.
    // Decide which algorithm to use and justify your choice in a comment.
    //
    // Fixed-window: simpler, divides time into fixed intervals.
    //   Track count per window. Reset when window expires.
    //
    // Sliding-window: smoother, avoids burst at window boundaries.
    //   Track timestamps of each request. Count requests within the window.
    //
    // Return { count: currentCount, resetInSeconds: secondsUntilReset }
    throw new Error(
      'Not implemented: track request count per key within a time window. ' +
        'Return current count and seconds until window reset.',
    );
  }

  async get(_key: string): Promise<{ count: number; resetInSeconds: number } | null> {
    throw new Error('Not implemented: return current state for key without incrementing');
  }
}

/**
 * Rate Limit Guard — protects endpoints from excessive requests.
 *
 * // TODO(you): implement a fixed-window OR sliding-window limiter.
 * Decide which and justify in a comment.
 * N requests per window per key (key = clientId from route params).
 *
 * // TODO(you): return HTTP 429 with a Retry-After header when the limit is exceeded.
 *
 * Wire this guard on the public consult endpoint.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly store: RateLimitStore) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    // TODO(you): implement rate limiting logic:
    // 1. Extract the key from the request (e.g., clientId from route params)
    // 2. Call store.hit(key) to record the request
    // 3. If count > maxRequests, throw HttpException(429) with Retry-After header
    // 4. Otherwise, allow the request
    //
    // Hint: Use the ExecutionContext to get the HTTP request object:
    //   const request = context.switchToHttp().getRequest();
    //   const clientId = request.params.clientId;
    //
    // For the 429 response, use:
    //   const response = context.switchToHttp().getResponse();
    //   response.setHeader('Retry-After', resetInSeconds.toString());
    //   throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);

    return true; // No-op: allows everything through until implemented
  }
}
