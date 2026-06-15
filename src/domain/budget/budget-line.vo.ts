import { ValueObject } from '@domain/shared';

export type BudgetLineType = 'SERVICE' | 'PART';

interface BudgetLineProps {
  type: BudgetLineType;
  referenceId: string; // partId or serviceId
  description: string;
  quantity: number;
  frozenUnitPrice: number; // price frozen at budget creation time
}

/**
 * BudgetLine Value Object — represents a single line item in a budget.
 *
 * // TODO(you): implement the BudgetLine with these rules:
 * - `lineTotal` must equal `quantity * frozenUnitPrice`
 * - `quantity` must be > 0
 * - `frozenUnitPrice` must be >= 0
 * - `description` must not be empty
 * - The price is "frozen" — it's captured at budget creation time
 *   and does NOT change even if the part/service price changes later
 */
export class BudgetLine extends ValueObject<BudgetLineProps> {
  private constructor(props: BudgetLineProps) {
    super(props);
  }

  get type(): BudgetLineType {
    return this.props.type;
  }

  get referenceId(): string {
    return this.props.referenceId;
  }

  get description(): string {
    return this.props.description;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get frozenUnitPrice(): number {
    return this.props.frozenUnitPrice;
  }

  /**
   * // TODO(you): total must equal quantity * frozenUnitPrice
   */
  get lineTotal(): number {
    throw new Error(
      'Not implemented: return quantity * frozenUnitPrice. ' +
        'This seems trivial but it establishes the price-freezing pattern.',
    );
  }

  /**
   * // TODO(you): validate all invariants and return a new BudgetLine
   */
  static create(
    type: BudgetLineType,
    referenceId: string,
    description: string,
    quantity: number,
    frozenUnitPrice: number,
  ): BudgetLine {
    throw new Error(
      'Not implemented: validate quantity > 0, frozenUnitPrice >= 0, description not empty. ' +
        'Return new BudgetLine with frozen price snapshot.',
    );
  }
}
