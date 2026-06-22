import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetLineDto {
  @ApiProperty({ example: 'SERVICE', enum: ['SERVICE', 'PART'] })
  @IsString()
  @IsIn(['SERVICE', 'PART'])
  type!: 'SERVICE' | 'PART';

  @ApiProperty({ example: 'uuid-da-peca-ou-servico' })
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  frozenUnitPrice!: number;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 'uuid-da-ordem-de-servico' })
  @IsString()
  @IsNotEmpty()
  serviceOrderId!: string;

  @ApiProperty({ type: [BudgetLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetLineDto)
  lines!: BudgetLineDto[];
}
