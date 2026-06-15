import { Entity, DomainException } from '@domain/shared';
import { CpfCnpj } from './cpf-cnpj.vo';

export interface CreateClientProps {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

export class Client extends Entity {
  private _name: string;
  private _cpfCnpj: CpfCnpj;
  private _email: string | null;
  private _phone: string | null;
  private _vehicleIds: string[];

  constructor(props: CreateClientProps, id?: string) {
    super(id);

    if (!props.name || props.name.trim().length === 0) {
      throw DomainException.of('Client name is required');
    }

    this._name = props.name.trim();
    this._cpfCnpj = CpfCnpj.create(props.cpfCnpj);
    this._email = props.email ?? null;
    this._phone = props.phone ?? null;
    this._vehicleIds = [];
  }

  get name(): string {
    return this._name;
  }

  get cpfCnpj(): CpfCnpj {
    return this._cpfCnpj;
  }

  get email(): string | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get vehicleIds(): ReadonlyArray<string> {
    return [...this._vehicleIds];
  }

  addVehicle(vehicleId: string): void {
    if (!vehicleId) {
      throw DomainException.of('Vehicle ID is required');
    }
    if (this._vehicleIds.includes(vehicleId)) {
      throw DomainException.of('Vehicle already associated with this client');
    }
    this._vehicleIds.push(vehicleId);
    this.touch();
  }

  update(props: { name?: string; email?: string; phone?: string }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw DomainException.of('Client name is required');
      }
      this._name = props.name.trim();
    }
    if (props.email !== undefined) {
      this._email = props.email;
    }
    if (props.phone !== undefined) {
      this._phone = props.phone;
    }
    this.touch();
  }

  static reconstitute(
    id: string,
    name: string,
    cpfCnpjValue: string,
    email: string | null,
    phone: string | null,
    vehicleIds: string[],
  ): Client {
    const client = Object.create(Client.prototype) as Client;
    Object.defineProperty(client, 'id', { value: id, writable: false });
    Object.defineProperty(client, 'createdAt', { value: new Date(), writable: false });
    client.updatedAt = new Date();
    client._name = name;
    client._cpfCnpj = CpfCnpj.create(cpfCnpjValue);
    client._email = email;
    client._phone = phone;
    client._vehicleIds = vehicleIds;
    return client;
  }
}
