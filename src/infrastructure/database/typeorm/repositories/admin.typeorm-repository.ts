import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '@domain/admin/admin.entity';
import { AdminRepository } from '@domain/admin/admin-repository.port';
import { AdminOrmEntity } from '../entities/admin.orm-entity';

@Injectable()
export class AdminTypeOrmRepository extends AdminRepository {
  constructor(
    @InjectRepository(AdminOrmEntity)
    private readonly ormRepo: Repository<AdminOrmEntity>,
  ) {
    super();
  }

  async save(admin: Admin): Promise<void> {
    const orm = new AdminOrmEntity();
    orm.id = admin.id;
    orm.name = admin.name;
    orm.email = admin.email;
    orm.passwordHash = admin.passwordHash;
    await this.ormRepo.save(orm);
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const orm = await this.ormRepo.findOne({ where: { email } });
    if (!orm) return null;
    return Admin.reconstitute(orm.id, orm.name, orm.email, orm.passwordHash);
  }

  async findById(id: string): Promise<Admin | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    if (!orm) return null;
    return Admin.reconstitute(orm.id, orm.name, orm.email, orm.passwordHash);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.ormRepo.count({ where: { email } });
    return count > 0;
  }
}
