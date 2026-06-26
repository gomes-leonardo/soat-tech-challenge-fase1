import { Admin } from '@domain/admin/admin.entity';

describe('Admin Entity', () => {
  describe('create', () => {
    it('should create an admin with a hashed password and normalized email', async () => {
      const admin = await Admin.create({
        name: '  Vinicius Admin  ',
        email: 'ADMIN@Oficina.com',
        password: 'secret123',
      });

      expect(admin.id).toBeDefined();
      expect(admin.name).toBe('Vinicius Admin');
      expect(admin.email).toBe('admin@oficina.com');
      expect(admin.passwordHash).not.toBe('secret123');
      expect(admin.passwordHash.length).toBeGreaterThan(0);
    });

    it('should reject an empty name', async () => {
      await expect(
        Admin.create({ name: '   ', email: 'a@b.com', password: 'secret123' }),
      ).rejects.toThrow('name');
    });

    it('should reject an empty email', async () => {
      await expect(
        Admin.create({ name: 'Admin', email: '', password: 'secret123' }),
      ).rejects.toThrow('email');
    });

    it('should reject a password shorter than 6 characters', async () => {
      await expect(
        Admin.create({ name: 'Admin', email: 'a@b.com', password: '123' }),
      ).rejects.toThrow('6 characters');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for the correct password and false otherwise', async () => {
      const admin = await Admin.create({
        name: 'Admin',
        email: 'a@b.com',
        password: 'secret123',
      });

      expect(await admin.verifyPassword('secret123')).toBe(true);
      expect(await admin.verifyPassword('wrong-password')).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should rebuild an admin from persistence without re-hashing', () => {
      const admin = Admin.reconstitute('admin-1', 'Admin Padrão', 'admin@x.com', 'stored-hash');

      expect(admin.id).toBe('admin-1');
      expect(admin.name).toBe('Admin Padrão');
      expect(admin.email).toBe('admin@x.com');
      expect(admin.passwordHash).toBe('stored-hash');
    });
  });
});
