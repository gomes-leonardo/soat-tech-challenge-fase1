import { Service } from '@domain/service/service.entity';

describe('Service Entity', () => {
  const validProps = {
    name: 'Troca de óleo',
    basePrice: 150.0,
    estimatedMinutes: 30,
  };

  describe('creation with valid data', () => {
    it('should create a service with valid data', () => {
      const service = new Service(validProps);
      expect(service.id).toBeDefined();
      expect(service.name).toBe('Troca de óleo');
      expect(service.basePrice).toBe(150.0);
      expect(service.estimatedMinutes).toBe(30);
    });

    it('should trim the name', () => {
      const service = new Service({ ...validProps, name: '  Alinhamento  ' });
      expect(service.name).toBe('Alinhamento');
    });
  });

  describe('invariant: name is required', () => {
    it('should throw when name is empty', () => {
      expect(() => new Service({ ...validProps, name: '' })).toThrow();
    });

    it('should throw when name is whitespace only', () => {
      expect(() => new Service({ ...validProps, name: '   ' })).toThrow();
    });
  });

  describe('invariant: basePrice cannot be negative', () => {
    it('should throw when basePrice is negative', () => {
      expect(() => new Service({ ...validProps, basePrice: -10 })).toThrow();
    });

    it('should allow basePrice of zero (free service)', () => {
      const service = new Service({ ...validProps, basePrice: 0 });
      expect(service.basePrice).toBe(0);
    });
  });

  describe('invariant: estimatedMinutes must be positive', () => {
    it('should throw when estimatedMinutes is zero', () => {
      expect(() => new Service({ ...validProps, estimatedMinutes: 0 })).toThrow();
    });

    it('should throw when estimatedMinutes is negative', () => {
      expect(() => new Service({ ...validProps, estimatedMinutes: -5 })).toThrow();
    });
  });

  describe('updatePrice', () => {
    it('should update the price', () => {
      const service = new Service(validProps);
      service.updatePrice(200);
      expect(service.basePrice).toBe(200);
    });

    it('should reject negative price', () => {
      const service = new Service(validProps);
      expect(() => service.updatePrice(-1)).toThrow();
    });
  });

  describe('updateEstimatedTime', () => {
    it('should update estimated time', () => {
      const service = new Service(validProps);
      service.updateEstimatedTime(60);
      expect(service.estimatedMinutes).toBe(60);
    });

    it('should reject zero or negative time', () => {
      const service = new Service(validProps);
      expect(() => service.updateEstimatedTime(0)).toThrow();
      expect(() => service.updateEstimatedTime(-10)).toThrow();
    });
  });

  describe('updateName', () => {
    it('should update the name', () => {
      const service = new Service(validProps);
      service.updateName('Balanceamento');
      expect(service.name).toBe('Balanceamento');
    });

    it('should reject empty name', () => {
      const service = new Service(validProps);
      expect(() => service.updateName('')).toThrow();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a service from persistence data', () => {
      const service = Service.reconstitute('abc-123', 'Troca de óleo', 150, 30);
      expect(service.id).toBe('abc-123');
      expect(service.name).toBe('Troca de óleo');
      expect(service.basePrice).toBe(150);
      expect(service.estimatedMinutes).toBe(30);
    });
  });
});
