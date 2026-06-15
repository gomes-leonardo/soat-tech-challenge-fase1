import { Result } from './result';

export class Guard {
  static againstNullOrUndefined(value: unknown, argumentName: string): Result<void> {
    if (value === null || value === undefined || value === '') {
      return Result.fail<void>(`${argumentName} is required`);
    }
    return Result.ok<void>(undefined);
  }

  static againstNegative(value: number, argumentName: string): Result<void> {
    if (value < 0) {
      return Result.fail<void>(`${argumentName} cannot be negative`);
    }
    return Result.ok<void>(undefined);
  }

  static isOneOf(value: string, validValues: string[], argumentName: string): Result<void> {
    if (!validValues.includes(value)) {
      return Result.fail<void>(
        `${argumentName} must be one of: ${validValues.join(', ')}. Got: ${value}`,
      );
    }
    return Result.ok<void>(undefined);
  }

  static againstAtLeast(numChars: number, text: string, argumentName: string): Result<void> {
    if (text.length < numChars) {
      return Result.fail<void>(`${argumentName} must be at least ${numChars} characters`);
    }
    return Result.ok<void>(undefined);
  }
}
