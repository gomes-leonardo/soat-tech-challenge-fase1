import { Entity } from '@domain/shared';
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

/**
 * Budget Entity — represents a cost estimate for a service order.
 *
 * Key concepts to implement:
 *
 * // TODO(you): total must equal sum of all line totals (service prices + part prices).
 *   Each line stores its own frozenUnitPrice. The total is calculated from these
 *   frozen prices, NOT from current catalog prices.
 *
 * // TODO(you): prices are frozen at budget creation — store the price on each line,
 *   do not read it live from the catalog. If the catalog price changes after budget
 *   creation, the budget total must remain unchanged.
 *
 * // TODO(you): re-budget creates a NEW budget version and moves the OS back to
 *   'Aguardando aprovação'. The version number must increment by 1.
 *   Previous budget versions remain as historical records.
 *
 * Status transitions:
 *   PENDENTE → APROVADO
 *   PENDENTE → RECUSADO
 *   Once APROVADO or RECUSADO, status cannot change.
 */
export class Budget extends Entity {
  private _serviceOrderId!: string;
  private _lines!: BudgetLine[];
  private _status!: BudgetStatus;
  private _version!: number;
  private _frozenAt!: Date;

  constructor(props: CreateBudgetProps, id?: string) {
    super(id);

    // TODO(you): implement the constructor:
    // 1. Validate serviceOrderId is not empty
    // 2. Validate at least one line exists
    // 3. Create BudgetLine VOs from the input
    // 4. Set status to PENDENTE
    // 5. Set version (default 1 for first budget, or props.version)
    // 6. Set frozenAt to current date
    throw new Error(
      'Not implemented: validate props, create BudgetLine VOs, set initial status to PENDENTE. ' +
        'Prices must be frozen at this point — store them on each line.',
    );
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

  /**
   * // TODO(you): total = sum of all line totals
   */
  get total(): number {
    throw new Error(
      'Not implemented: return the sum of lineTotal for all lines. ' +
        'Remember: each line uses frozenUnitPrice, not current catalog price.',
    );
  }

  /**
   * // TODO(you): transition status to APROVADO.
   * Only allowed from PENDENTE.
   */
  approve(): void {
    throw new Error(
      'Not implemented: change status to APROVADO. Only valid from PENDENTE. ' +
        'Throw DomainException if already approved or refused.',
    );
  }

  /**
   * // TODO(you): transition status to RECUSADO.
   * Only allowed from PENDENTE.
   */
  refuse(): void {
    throw new Error(
      'Not implemented: change status to RECUSADO. Only valid from PENDENTE. ' +
        'Throw DomainException if already approved or refused.',
    );
  }

  /**
   * // TODO(you): create a new Budget version for re-budget.
   * Returns a new Budget with version = this.version + 1.
   * The new budget has its own lines and starts as PENDENTE.
   */
  static createNewVersion(
    previousBudget: Budget,
    newLines: CreateBudgetProps['lines'],
  ): Budget {
    throw new Error(
      'Not implemented: create a new Budget with version = previous.version + 1. ' +
        'The new budget starts as PENDENTE with its own frozen prices.',
    );
  }
}
