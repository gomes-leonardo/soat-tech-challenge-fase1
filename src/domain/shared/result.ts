export class Result<T> {
  private readonly _isOk: boolean;
  private readonly _value?: T;
  private readonly _error?: string;

  private constructor(isOk: boolean, value?: T, error?: string) {
    this._isOk = isOk;
    this._value = value;
    this._error = error;
  }

  get isOk(): boolean {
    return this._isOk;
  }

  get isFail(): boolean {
    return !this._isOk;
  }

  getValue(): T {
    if (!this._isOk) {
      throw new Error('Cannot get value of a failed result. Check isFail first.');
    }
    return this._value as T;
  }

  getError(): string {
    if (this._isOk) {
      throw new Error('Cannot get error of a successful result. Check isOk first.');
    }
    return this._error as string;
  }

  static ok<U>(value: U): Result<U> {
    return new Result<U>(true, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, undefined, error);
  }
}
