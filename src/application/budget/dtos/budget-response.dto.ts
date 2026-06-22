import { ApiProperty } from '@nestjs/swagger';
import { Budget } from '@domain/budget/budget.entity';

export class BudgetLineResponseDto {
  @ApiProperty()
  type!: string;

  @ApiProperty()
  referenceId!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  frozenUnitPrice!: number;

  @ApiProperty()
  lineTotal!: number;
}

export class BudgetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceOrderId!: string;

  @ApiProperty()
  lines!: BudgetLineResponseDto[];

  @ApiProperty()
  status!: string;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  frozenAt!: Date;

  static fromDomain(budget: Budget): BudgetResponseDto {
    const dto = new BudgetResponseDto();
    dto.id = budget.id;
    dto.serviceOrderId = budget.serviceOrderId;
    dto.lines = budget.lines.map((line) => ({
      type: line.type,
      referenceId: line.referenceId,
      description: line.description,
      quantity: line.quantity,
      frozenUnitPrice: line.frozenUnitPrice,
      lineTotal: line.lineTotal,
    }));
    dto.status = budget.status;
    dto.version = budget.version;
    dto.total = budget.total;
    dto.frozenAt = budget.frozenAt;
    return dto;
  }
}
