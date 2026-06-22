import { ValueObject, Result } from '@domain/shared';

interface PlateProps {
  value: string;
}

export class Plate extends ValueObject<PlateProps> {
  private constructor(props: PlateProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(raw: string): Result<Plate> {
    if (raw === null || raw.trim() === '') {
      return Result.fail('Plate cannot be empty or null');
    }

    const normalized = Plate.normalize(raw);
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulPlateRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    const isValid = oldPlateRegex.test(normalized) || mercosulPlateRegex.test(normalized);

    if (!isValid) {
      return Result.fail('Invalid vehicle plate format');
    }
    return Result.ok(new Plate({ value: normalized }));
  }

  private static normalize(raw: string): string {
    return raw.trim().toUpperCase().replace(/[-\s]/g, '');
  }
}
