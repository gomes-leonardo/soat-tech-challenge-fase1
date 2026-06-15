import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class RegisterClientDto {
  @ApiProperty({ example: 'João da Silva', description: 'Nome completo do cliente' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '529.982.247-25', description: 'CPF ou CNPJ do cliente' })
  @IsString()
  @IsNotEmpty()
  cpfCnpj!: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0000' })
  @IsOptional()
  @IsString()
  phone?: string;
}
