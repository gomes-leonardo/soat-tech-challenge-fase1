import { ValueObject, DomainException } from '@domain/shared';

interface CpfCnpjProps {
  value: string; // stored as digits only
}

export class CpfCnpj extends ValueObject<CpfCnpjProps> {
  private constructor(props: CpfCnpjProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get formatted(): string {
    const v = this.props.value;
    if (v.length === 11) {
      return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
    }
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
  }

  static create(raw: string): CpfCnpj {
    if (!raw) {
      throw DomainException.of('CPF/CNPJ is required');
    }

    const digits = raw.replace(/\D/g, '');

    if (digits.length === 11) {
      CpfCnpj.validateCpf(digits);
      return new CpfCnpj({ value: digits });
    }

    if (digits.length === 14) {
      CpfCnpj.validateCnpj(digits);
      return new CpfCnpj({ value: digits });
    }

    throw DomainException.of(`Invalid CPF/CNPJ: must have 11 or 14 digits, got ${digits.length}`);
  }

  private static validateCpf(digits: string): void {
    // Reject all same digits (e.g., 111.111.111-11)
    if (/^(\d)\1{10}$/.test(digits)) {
      throw DomainException.of('Invalid CPF: all digits are the same');
    }

    // First check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i], 10) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9], 10)) {
      throw DomainException.of('Invalid CPF: check digit verification failed');
    }

    // Second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i], 10) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[10], 10)) {
      throw DomainException.of('Invalid CPF: check digit verification failed');
    }
  }

  private static validateCnpj(digits: string): void {
    // Reject all same digits
    if (/^(\d)\1{13}$/.test(digits)) {
      throw DomainException.of('Invalid CNPJ: all digits are the same');
    }

    // First check digit — weights: 5,4,3,2,9,8,7,6,5,4,3,2
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i], 10) * weights1[i];
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(digits[12], 10)) {
      throw DomainException.of('Invalid CNPJ: check digit verification failed');
    }

    // Second check digit — weights: 6,5,4,3,2,9,8,7,6,5,4,3,2
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits[i], 10) * weights2[i];
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(digits[13], 10)) {
      throw DomainException.of('Invalid CNPJ: check digit verification failed');
    }
  }
}
