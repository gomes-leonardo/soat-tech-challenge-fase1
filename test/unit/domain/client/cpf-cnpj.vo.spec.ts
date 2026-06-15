import { CpfCnpj } from '@domain/client/cpf-cnpj.vo';

describe('CpfCnpj Value Object', () => {
  describe('CPF validation', () => {
    it('should accept a valid CPF with formatting', () => {
      const cpf = CpfCnpj.create('529.982.247-25');
      expect(cpf.value).toBe('52998224725');
      expect(cpf.formatted).toBe('529.982.247-25');
    });

    it('should accept a valid CPF without formatting', () => {
      const cpf = CpfCnpj.create('52998224725');
      expect(cpf.value).toBe('52998224725');
    });

    it('should accept another valid CPF', () => {
      const cpf = CpfCnpj.create('111.444.777-35');
      expect(cpf.value).toBe('11144477735');
    });

    it('should reject CPF with invalid first check digit', () => {
      expect(() => CpfCnpj.create('529.982.247-15')).toThrow('check digit');
    });

    it('should reject CPF with invalid second check digit', () => {
      expect(() => CpfCnpj.create('529.982.247-26')).toThrow('check digit');
    });

    it('should reject CPF with all same digits (111.111.111-11)', () => {
      expect(() => CpfCnpj.create('111.111.111-11')).toThrow('all digits are the same');
    });

    it('should reject CPF with all same digits (000.000.000-00)', () => {
      expect(() => CpfCnpj.create('000.000.000-00')).toThrow('all digits are the same');
    });

    it('should reject CPF with all same digits (999.999.999-99)', () => {
      expect(() => CpfCnpj.create('999.999.999-99')).toThrow('all digits are the same');
    });

    it('should reject CPF with wrong length', () => {
      expect(() => CpfCnpj.create('1234567890')).toThrow('must have 11 or 14 digits');
    });
  });

  describe('CNPJ validation', () => {
    it('should accept a valid CNPJ with formatting', () => {
      const cnpj = CpfCnpj.create('11.222.333/0001-81');
      expect(cnpj.value).toBe('11222333000181');
      expect(cnpj.formatted).toBe('11.222.333/0001-81');
    });

    it('should accept a valid CNPJ without formatting', () => {
      const cnpj = CpfCnpj.create('11222333000181');
      expect(cnpj.value).toBe('11222333000181');
    });

    it('should reject CNPJ with invalid check digits', () => {
      expect(() => CpfCnpj.create('11.222.333/0001-82')).toThrow('check digit');
    });

    it('should reject CNPJ with all same digits', () => {
      expect(() => CpfCnpj.create('11.111.111/1111-11')).toThrow('all digits are the same');
    });

    it('should reject CNPJ 00.000.000/0000-00', () => {
      expect(() => CpfCnpj.create('00.000.000/0000-00')).toThrow('all digits are the same');
    });
  });

  describe('general', () => {
    it('should throw on empty input', () => {
      expect(() => CpfCnpj.create('')).toThrow('CPF/CNPJ is required');
    });

    it('should throw on null-ish input', () => {
      expect(() => CpfCnpj.create(null as unknown as string)).toThrow('CPF/CNPJ is required');
    });

    it('should have structural equality', () => {
      const a = CpfCnpj.create('529.982.247-25');
      const b = CpfCnpj.create('52998224725');
      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different values', () => {
      const a = CpfCnpj.create('529.982.247-25');
      const b = CpfCnpj.create('111.444.777-35');
      expect(a.equals(b)).toBe(false);
    });
  });
});
