import { ValueObject } from '@domain/shared';

export type BudgetLineType = 'SERVICE' | 'PART';

interface BudgetLineProps {
  type: BudgetLineType;
  referenceId: string; // partId or serviceId
  description: string;
  quantity: number;
  frozenUnitPrice: number; // price frozen at budget creation time
}

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

  get lineTotal(): number {
    return this.quantity * this.frozenUnitPrice;
  }

  static create(
    type: BudgetLineType,
    referenceId: string,
    description: string,
    quantity: number,
    frozenUnitPrice: number,
  ): BudgetLine {
    if (quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    if (frozenUnitPrice < 0) {
      throw new Error('Frozen unit price must be a non-negative number');
    }
    if (!description.trim()) {
      throw new Error('Description is required');
    }
    return new BudgetLine({ type, referenceId, description, quantity, frozenUnitPrice });
  }
}
