import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { StatusHistory, StatusHistoryEntry } from '@domain/service-order/status-history.vo';
import { ServiceOrderOrmEntity } from '../entities/service-order.orm-entity';

@Injectable()
export class ServiceOrderTypeOrmRepository extends ServiceOrderRepository {
  constructor(
    @InjectRepository(ServiceOrderOrmEntity)
    private readonly ormRepo: Repository<ServiceOrderOrmEntity>,
  ) {
    super();
  }

  async save(serviceOrder: ServiceOrder): Promise<void> {
    const orm = this.toOrmEntity(serviceOrder);
    await this.ormRepo.save(orm);
  }

  async findById(id: string): Promise<ServiceOrder | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomainEntity(orm);
  }

  async findByClientId(clientId: string): Promise<ServiceOrder[]> {
    const orms = await this.ormRepo.find({ where: { clientId } });
    return orms.map((orm) => this.toDomainEntity(orm));
  }

  async findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]> {
    const orms = await this.ormRepo.find({ where: { status } });
    return orms.map((orm) => this.toDomainEntity(orm));
  }

  async findAll(): Promise<ServiceOrder[]> {
    const orms = await this.ormRepo.find();
    return orms.map((orm) => this.toDomainEntity(orm));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toOrmEntity(so: ServiceOrder): ServiceOrderOrmEntity {
    const orm = new ServiceOrderOrmEntity();
    orm.id = so.id;
    orm.clientId = so.clientId;
    orm.vehicleId = so.vehicleId;
    orm.description = so.description;
    orm.status = so.status;
    orm.budgetId = so.budgetId;
    orm.statusHistory = so.statusHistory.toJSON();
    return orm;
  }

  private toDomainEntity(orm: ServiceOrderOrmEntity): ServiceOrder {
    const history = StatusHistory.fromJSON(orm.statusHistory as StatusHistoryEntry[]);
    return ServiceOrder.reconstitute(
      orm.id,
      orm.clientId,
      orm.vehicleId,
      orm.description,
      orm.status,
      history,
      orm.budgetId,
    );
  }
}
