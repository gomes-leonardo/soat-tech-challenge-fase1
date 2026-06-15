import { randomUUID } from 'crypto';

export abstract class Entity {
  readonly id: string;
  readonly createdAt: Date;
  protected updatedAt: Date;

  constructor(id?: string) {
    this.id = id ?? randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  equals(other: Entity): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this.id === other.id;
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
