/**
 * GAP A — Vehicle Entity Tests
 *
 * These tests are COMPLETE and will FAIL until you implement the Vehicle constructor.
 * Your goal: make every test below pass by implementing the validation logic
 * in src/domain/vehicle/vehicle.entity.ts.
 *
 * Study the Client entity tests (test/unit/domain/client/client.entity.spec.ts)
 * as a reference for the pattern.
 */
import { Vehicle } from '@domain/vehicle/vehicle.entity';

describe('Vehicle Entity', () => {
  const validProps = {
    plate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    ownerClientId: 'client-123',
  };

  describe('creation with valid data', () => {
    it('should create a vehicle with valid data', () => {
      const vehicle = new Vehicle(validProps);
      expect(vehicle.id).toBeDefined();
      expect(vehicle.plate.value).toBe('ABC1234');
      expect(vehicle.brand).toBe('Toyota');
      expect(vehicle.model).toBe('Corolla');
      expect(vehicle.year).toBe(2022);
      expect(vehicle.ownerClientId).toBe('client-123');
    });

    it('should create a vehicle with Mercosul plate', () => {
      const vehicle = new Vehicle({ ...validProps, plate: 'ABC1D23' });
      expect(vehicle.plate.value).toBe('ABC1D23');
    });
  });

  describe('invariant: ownerClientId is required', () => {
    it('should throw when ownerClientId is empty', () => {
      expect(
        () => new Vehicle({ ...validProps, ownerClientId: '' }),
      ).toThrow();
    });

    it('should throw when ownerClientId is undefined', () => {
      expect(
        () =>
          new Vehicle({
            ...validProps,
            ownerClientId: undefined as unknown as string,
          }),
      ).toThrow();
    });
  });

  describe('invariant: plate is required and valid', () => {
    it('should throw when plate is invalid', () => {
      expect(
        () => new Vehicle({ ...validProps, plate: 'INVALID' }),
      ).toThrow();
    });

    it('should throw when plate is empty', () => {
      expect(
        () => new Vehicle({ ...validProps, plate: '' }),
      ).toThrow();
    });
  });

  describe('invariant: brand and model are required', () => {
    it('should throw when brand is empty', () => {
      expect(
        () => new Vehicle({ ...validProps, brand: '' }),
      ).toThrow();
    });

    it('should throw when model is empty', () => {
      expect(
        () => new Vehicle({ ...validProps, model: '' }),
      ).toThrow();
    });
  });

  describe('invariant: year must be reasonable', () => {
    it('should throw when year is too old (< 1900)', () => {
      expect(
        () => new Vehicle({ ...validProps, year: 1800 }),
      ).toThrow();
    });

    it('should throw when year is in the far future', () => {
      const farFuture = new Date().getFullYear() + 2;
      expect(
        () => new Vehicle({ ...validProps, year: farFuture }),
      ).toThrow();
    });

    it('should accept current year + 1 (next model year)', () => {
      const nextYear = new Date().getFullYear() + 1;
      const vehicle = new Vehicle({ ...validProps, year: nextYear });
      expect(vehicle.year).toBe(nextYear);
    });
  });
});
