export class DomainException extends Error {
  readonly name = 'DomainException';

  private constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainException.prototype);
  }

  static of(message: string): DomainException {
    return new DomainException(message);
  }
}
