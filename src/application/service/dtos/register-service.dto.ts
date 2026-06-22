import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RegisterServiceDto {
  @ApiProperty({ example: 'Troca de óleo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({ example: 30, description: 'Tempo estimado em minutos' })
  @IsNumber()
  @Min(1)
  estimatedMinutes!: number;
}
