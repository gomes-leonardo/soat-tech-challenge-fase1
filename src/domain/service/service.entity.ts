import { Entity, DomainException } from '@domain/shared';

export interface CreateServiceProps {
  name: string;
  basePrice: number;
  estimatedMinutes: number;
}

export class Service extends Entity {
  private _name: string;
  private _basePrice: number;
  private _estimatedMinutes: number;

  constructor(props: CreateServiceProps, id?: string) {
    super(id);

    if (!props.name || props.name.trim().length === 0) {
      throw DomainException.of('Service name is required');
    }
    if (props.basePrice < 0) {
      throw DomainException.of('Base price cannot be negative');
    }
    if (props.estimatedMinutes <= 0) {
      throw DomainException.of('Estimated time must be positive');
    }

    this._name = props.name.trim();
    this._basePrice = props.basePrice;
    this._estimatedMinutes = props.estimatedMinutes;
  }

  get name(): string {
    return this._name;
  }

  get basePrice(): number {
    return this._basePrice;
  }

  get estimatedMinutes(): number {
    return this._estimatedMinutes;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw DomainException.of('Base price cannot be negative');
    }
    this._basePrice = newPrice;
    this.touch();
  }

  updateEstimatedTime(minutes: number): void {
    if (minutes <= 0) {
      throw DomainException.of('Estimated time must be positive');
    }
    this._estimatedMinutes = minutes;
    this.touch();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw DomainException.of('Service name is required');
    }
    this._name = name.trim();
    this.touch();
  }

  static reconstitute(
    id: string,
    name: string,
    basePrice: number,
    estimatedMinutes: number,
  ): Service {
    const service = Object.create(Service.prototype) as Service;
    Object.defineProperty(service, 'id', { value: id, writable: false });
    Object.defineProperty(service, 'createdAt', { value: new Date(), writable: false });
    service.updatedAt = new Date();
    service._name = name;
    service._basePrice = basePrice;
    service._estimatedMinutes = estimatedMinutes;
    return service;
  }
}
