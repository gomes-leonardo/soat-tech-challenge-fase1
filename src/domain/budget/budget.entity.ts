import { DomainException, Entity } from '@domain/shared';
import { BudgetLine, BudgetLineType } from './budget-line.vo';

export enum BudgetStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  RECUSADO = 'RECUSADO',
}

export interface CreateBudgetProps {
  serviceOrderId: string;
  lines: Array<{
    type: BudgetLineType;
    referenceId: string;
    description: string;
    quantity: number;
    frozenUnitPrice: number;
  }>;
  version?: number;
}

export class Budget extends Entity {
  private _serviceOrderId!: string;
  private _lines!: BudgetLine[];
  private _status!: BudgetStatus;
  private _version!: number;
  private _frozenAt!: Date;

  constructor(props: CreateBudgetProps, id?: string) {
    super(id);

    if (!props.serviceOrderId || props.serviceOrderId.trim() === '') {
      throw new Error('Service order ID is required');
    }
    if (props.lines.length === 0) {
      throw new Error('At least one budget line is required');
    }

    this._serviceOrderId = props.serviceOrderId;
    this._lines = props.lines.map((line) =>
      BudgetLine.create(
        line.type,
        line.referenceId,
        line.description,
        line.quantity,
        line.frozenUnitPrice,
      ),
    );
    this._status = BudgetStatus.PENDENTE;
    this._version = props.version ?? 1;
    this._frozenAt = new Date();
  }

  get serviceOrderId(): string {
    return this._serviceOrderId;
  }

  get lines(): ReadonlyArray<BudgetLine> {
    return [...this._lines];
  }

  get status(): BudgetStatus {
    return this._status;
  }

  get version(): number {
    return this._version;
  }

  get frozenAt(): Date {
    return this._frozenAt;
  }

  get total(): number {
    return this._lines.reduce((sum, line) => sum + line.lineTotal, 0);
  }

  approve(): void {
    if (this._status != BudgetStatus.PENDENTE) {
      throw DomainException.of('Status need to be PENDENTE');
    }
    this._status = BudgetStatus.APROVADO;
  }

  refuse(): void {
    if (this._status != BudgetStatus.PENDENTE) {
      throw DomainException.of('Status need to be PENDENTE');
    }
    this._status = BudgetStatus.RECUSADO;
  }

  static createNewVersion(previousBudget: Budget, newLines: CreateBudgetProps['lines']): Budget {
    return new Budget({
      serviceOrderId: previousBudget.serviceOrderId,
      lines: newLines,
      version: previousBudget.version + 1,
    });
  }
}
