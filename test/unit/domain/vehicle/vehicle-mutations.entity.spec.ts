import { Vehicle } from '@domain/vehicle/vehicle.entity';

describe('Vehicle mutations', () => {
  const base = () =>
    new Vehicle({
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      ownerClientId: 'client-123',
    });

  describe('updateInfo', () => {
    it('should update brand, model and year', () => {
      const v = base();
      v.updateInfo({ brand: 'Ford', model: 'Ka', year: 2021 });
      expect(v.brand).toBe('Ford');
      expect(v.model).toBe('Ka');
      expect(v.year).toBe(2021);
    });

    it('should update only the provided fields', () => {
      const v = base();
      v.updateInfo({ brand: 'Volkswagen' });
      expect(v.brand).toBe('Volkswagen');
      expect(v.model).toBe('Corolla');
      expect(v.year).toBe(2022);
    });

    it('should trim the updated brand/model', () => {
      const v = base();
      v.updateInfo({ brand: '  VW  ', model: '  Gol  ' });
      expect(v.brand).toBe('VW');
      expect(v.model).toBe('Gol');
    });

    it('should reject an empty brand', () => {
      expect(() => base().updateInfo({ brand: '   ' })).toThrow('Brand');
    });

    it('should reject an empty model', () => {
      expect(() => base().updateInfo({ model: '' })).toThrow('Model');
    });

    it('should reject an out-of-range year', () => {
      expect(() => base().updateInfo({ year: 1800 })).toThrow('Year');
      expect(() => base().updateInfo({ year: new Date().getFullYear() + 5 })).toThrow('Year');
    });
  });

  describe('reconstitute', () => {
    it('should rebuild a vehicle from persistence', () => {
      const v = Vehicle.reconstitute('veh-1', 'ABC1234', 'Fiat', 'Uno', 2019, 'client-9');
      expect(v.id).toBe('veh-1');
      expect(v.plate.value).toBe('ABC1234');
      expect(v.brand).toBe('Fiat');
      expect(v.model).toBe('Uno');
      expect(v.year).toBe(2019);
      expect(v.ownerClientId).toBe('client-9');
    });
  });
});
