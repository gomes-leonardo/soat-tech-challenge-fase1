import { ValueObject, Result } from '@domain/shared';

interface PlateProps {
  value: string;
}

/**
 * Plate Value Object — represents a Brazilian vehicle plate.
 *
 * Must support two formats:
 * - Old format: ABC-1234 (3 letters + dash + 4 digits)
 * - Mercosul format: ABC1D23 (3 letters + 1 digit + 1 letter + 2 digits)
 *
 * Both formats should be stored normalized: uppercase, no dashes/spaces.
 */
export class Plate extends ValueObject<PlateProps> {
  private constructor(props: PlateProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Creates a validated Plate value object.
   *
   * // TODO(you): implement plate validation for both Brazilian formats.
   *
   * Requirements:
   * - Accept old format: ABC-1234, ABC1234 (with or without dash)
   * - Accept Mercosul format: ABC1D23
   * - Normalize to uppercase, strip dashes and spaces
   * - Reject any input that doesn't match either format
   * - Reject empty/null input
   *
   * Hint: use two regex patterns, one for each format.
   * Old format (after normalization): /^[A-Z]{3}\d{4}$/
   * Mercosul format: /^[A-Z]{3}\d[A-Z]\d{2}$/
   */
  static create(raw: string): Result<Plate> {
    throw new Error(
      'Not implemented: validate the plate string against old Brazilian and Mercosul formats, ' +
        'normalize it, and return Result.ok(new Plate(...)) or Result.fail(...)',
    );
  }
}
