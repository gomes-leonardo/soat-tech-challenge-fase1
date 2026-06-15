import { Entity } from '@domain/shared';
import { Plate } from './plate.vo';

export interface CreateVehicleProps {
  plate: string;
  brand: string;
  model: string;
  year: number;
  ownerClientId: string;
}

/**
 * Vehicle Entity — represents a vehicle registered in the system.
 *
 * // TODO(you): implement the constructor with the following invariants:
 * - A vehicle MUST belong to a client (ownerClientId is required)
 * - Plate must be validated via the Plate value object
 * - Brand and model are required strings
 * - Year must be a reasonable value (e.g., >= 1900 and <= current year + 1)
 *
 * Mirror the Client entity reference implementation for guidance.
 */
export class Vehicle extends Entity {
  private _plate!: Plate;
  private _brand!: string;
  private _model!: string;
  private _year!: number;
  private _ownerClientId!: string;

  constructor(props: CreateVehicleProps, id?: string) {
    super(id);

    // TODO(you): a vehicle must belong to a client; enforce it.
    // Validate all required fields, create the Plate VO, and assign properties.
    // Throw DomainException on invalid data.
    throw new Error(
      'Not implemented: validate props, create Plate VO, assign all properties. ' +
        'A vehicle must belong to a client — ownerClientId is required.',
    );
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
}
