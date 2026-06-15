import { ValueObject } from '@domain/shared';

class TestVO extends ValueObject<{ value: string }> {
  constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

describe('ValueObject (base)', () => {
  it('should be equal when props are the same', () => {
    const a = new TestVO('hello');
    const b = new TestVO('hello');
    expect(a.equals(b)).toBe(true);
  });

  it('should not be equal when props differ', () => {
    const a = new TestVO('hello');
    const b = new TestVO('world');
    expect(a.equals(b)).toBe(false);
  });

  it('should return false when comparing with null', () => {
    const a = new TestVO('hello');
    expect(a.equals(null as unknown as TestVO)).toBe(false);
  });

  it('should return true when comparing with itself', () => {
    const a = new TestVO('hello');
    expect(a.equals(a)).toBe(true);
  });

  it('should have immutable props', () => {
    const a = new TestVO('hello');
    expect(() => {
      (a as any).props.value = 'changed';
    }).toThrow();
  });
});
