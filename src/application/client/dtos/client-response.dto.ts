import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Client } from '@domain/client/client.entity';

export class ClientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'CPF/CNPJ formatado' })
  cpfCnpj!: string;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiProperty({ type: [String] })
  vehicleIds!: string[];

  static fromDomain(client: Client): ClientResponseDto {
    const dto = new ClientResponseDto();
    dto.id = client.id;
    dto.name = client.name;
    dto.cpfCnpj = client.cpfCnpj.formatted;
    dto.email = client.email;
    dto.phone = client.phone;
    dto.vehicleIds = [...client.vehicleIds];
    return dto;
  }
}
