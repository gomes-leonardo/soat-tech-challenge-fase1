import { Admin } from './admin.entity';

export abstract class AdminRepository {
  abstract save(admin: Admin): Promise<void>;
  abstract findByEmail(email: string): Promise<Admin | null>;
  abstract findById(id: string): Promise<Admin | null>;
  abstract existsByEmail(email: string): Promise<boolean>;
}
