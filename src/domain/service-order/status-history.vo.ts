import { ServiceOrderStatus } from './service-order-status.enum';

export interface StatusHistoryEntry {
  fromStatus: ServiceOrderStatus | null;
  toStatus: ServiceOrderStatus;
  changedAt: Date;
  changedBy: string;
}

export class StatusHistory {
  private readonly _entries: StatusHistoryEntry[];

  constructor(entries?: StatusHistoryEntry[]) {
    this._entries = entries ? [...entries] : [];
  }

  get entries(): ReadonlyArray<StatusHistoryEntry> {
    return [...this._entries];
  }

  get length(): number {
    return this._entries.length;
  }

  record(
    fromStatus: ServiceOrderStatus | null,
    toStatus: ServiceOrderStatus,
    changedBy: string,
  ): void {
    this._entries.push({
      fromStatus,
      toStatus,
      changedAt: new Date(),
      changedBy,
    });
  }

  toJSON(): StatusHistoryEntry[] {
    return [...this._entries];
  }

  static fromJSON(data: StatusHistoryEntry[]): StatusHistory {
    return new StatusHistory(data);
  }
}
