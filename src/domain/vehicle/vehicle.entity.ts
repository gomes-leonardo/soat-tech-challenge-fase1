import { DomainException, Entity } from '@domain/shared';
import { Plate } from './plate.vo';

export interface CreateVehicleProps {
  plate: string;
  brand: string;
  model: string;
  year: number;
  ownerClientId: string;
}

export class Vehicle extends Entity {
  private _plate!: Plate;
  private _brand!: string;
  private _model!: string;
  private _year!: number;
  private _ownerClientId!: string;

  constructor(props: CreateVehicleProps, id?: string) {
    super(id);

    if (props.ownerClientId === null || props.ownerClientId.trim() === '') {
      throw DomainException.of('Owner client ID is required');
    }
    if (!props.plate) {
      throw DomainException.of('Plate is required');
    }

    if (props.year < 1900 || props.year > new Date().getFullYear() + 1) {
      throw DomainException.of('Year must be between 1900 and next year');
    }
    if (props.brand === null || props.brand.trim() === '') {
      throw DomainException.of('Brand is required');
    }
    if (props.model === null || props.model.trim() === '') {
      throw DomainException.of('Model is required');
    }

    Plate.create(props.plate).getValue();

    this._ownerClientId = props.ownerClientId;
    this._plate = Plate.create(props.plate).getValue();
    this._brand = props.brand;
    this._model = props.model;
    this._year = props.year;
  }

  get plate(): Plate {
    return this._plate;
  }

  get brand(): string {
    return this._brand;
  }

  get model(): string {
    return this._model;
  }

  get year(): number {
    return this._year;
  }

  get ownerClientId(): string {
    return this._ownerClientId;
  }

  updateInfo(props: { brand?: string; model?: string; year?: number }): void {
    if (props.brand !== undefined) {
      if (!props.brand || props.brand.trim() === '') {
        throw DomainException.of('Brand is required');
      }
      this._brand = props.brand.trim();
    }
    if (props.model !== undefined) {
      if (!props.model || props.model.trim() === '') {
        throw DomainException.of('Model is required');
      }
      this._model = props.model.trim();
    }
    if (props.year !== undefined) {
      if (props.year < 1900 || props.year > new Date().getFullYear() + 1) {
        throw DomainException.of('Year must be between 1900 and next year');
      }
      this._year = props.year;
    }
    this.touch();
  }

  static reconstitute(
    id: string,
    plate: string,
    brand: string,
    model: string,
    year: number,
    ownerClientId: string,
  ): Vehicle {
    const vehicle = Object.create(Vehicle.prototype) as Vehicle;
    Object.defineProperty(vehicle, 'id', { value: id, writable: false });
    Object.defineProperty(vehicle, 'createdAt', { value: new Date(), writable: false });
    vehicle.updatedAt = new Date();
    vehicle._plate = Plate.create(plate).getValue();
    vehicle._brand = brand;
    vehicle._model = model;
    vehicle._year = year;
    vehicle._ownerClientId = ownerClientId;
    return vehicle;
  }
}
