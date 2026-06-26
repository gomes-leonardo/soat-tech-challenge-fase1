import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetLineDto {
  @ApiProperty({ example: 'SERVICE', enum: ['SERVICE', 'PART'] })
  @IsString()
  @IsIn(['SERVICE', 'PART'])
  type!: 'SERVICE' | 'PART';

  @ApiProperty({
    example: 'uuid-da-peca-ou-servico',
    description:
      'ID do servico (catalogo) ou da peca (estoque). Preco e descricao sao buscados do catalogo.',
  })
  @IsString()
  @IsNotEmpty()
  referenceId!: string;

  @ApiProperty({ example: 1, description: 'Quantidade do item' })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateBudgetDto {
  @ApiProperty({ example: 'uuid-da-ordem-de-servico' })
  @IsString()
  @IsNotEmpty()
  serviceOrderId!: string;

  @ApiProperty({
    type: [BudgetLineDto],
    description:
      'Itens do orcamento. O preco unitario e a descricao sao resolvidos ' +
      'automaticamente a partir do catalogo (Service/Part) e congelados.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetLineDto)
  lines!: BudgetLineDto[];
}
