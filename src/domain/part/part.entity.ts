import { Entity, DomainException } from '@domain/shared';

export interface CreatePartProps {
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
}

export class Part extends Entity {
  private _name: string;
  private _sku: string;
  private _unitPrice: number;
  private _stockQuantity: number;

  constructor(props: CreatePartProps, id?: string) {
    super(id);

    if (!props.name || props.name.trim().length === 0) {
      throw DomainException.of('Part name is required');
    }
    if (!props.sku || props.sku.trim().length === 0) {
      throw DomainException.of('Part SKU is required');
    }
    if (props.unitPrice < 0) {
      throw DomainException.of('Unit price cannot be negative');
    }
    if (props.stockQuantity < 0) {
      throw DomainException.of('Stock quantity cannot be negative');
    }

    this._name = props.name.trim();
    this._sku = props.sku.trim().toUpperCase();
    this._unitPrice = props.unitPrice;
    this._stockQuantity = props.stockQuantity;
  }

  get name(): string {
    return this._name;
  }

  get sku(): string {
    return this._sku;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  decrementStock(quantity: number): void {
    if (quantity <= 0) {
      throw DomainException.of('Decrement quantity must be positive');
    }
    if (this._stockQuantity - quantity < 0) {
      throw DomainException.of(
        `Insufficient stock for part '${this._name}': available=${this._stockQuantity}, requested=${quantity}`,
      );
    }
    this._stockQuantity -= quantity;
    this.touch();
  }

  incrementStock(quantity: number): void {
    if (quantity <= 0) {
      throw DomainException.of('Increment quantity must be positive');
    }
    this._stockQuantity += quantity;
    this.touch();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw DomainException.of('Part name is required');
    }
    this._name = name.trim();
    this.touch();
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw DomainException.of('Unit price cannot be negative');
    }
    this._unitPrice = newPrice;
    this.touch();
  }

  static reconstitute(
    id: string,
    name: string,
    sku: string,
    unitPrice: number,
    stockQuantity: number,
  ): Part {
    const part = Object.create(Part.prototype) as Part;
    Object.defineProperty(part, 'id', { value: id, writable: false });
    Object.defineProperty(part, 'createdAt', { value: new Date(), writable: false });
    part.updatedAt = new Date();
    part._name = name;
    part._sku = sku;
    part._unitPrice = unitPrice;
    part._stockQuantity = stockQuantity;
    return part;
  }
}
