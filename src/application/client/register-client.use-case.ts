import { Injectable } from '@nestjs/common';
import { Client } from '@domain/client/client.entity';
import { ClientRepository } from '@domain/client/client-repository.port';
import { DomainException } from '@domain/shared';
import { ClientResponseDto } from './dtos/client-response.dto';

export interface RegisterClientInput {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class RegisterClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(input: RegisterClientInput): Promise<ClientResponseDto> {
    const cpfCnpjDigits = input.cpfCnpj.replace(/\D/g, '');
    const exists = await this.clientRepository.existsByCpfCnpj(cpfCnpjDigits);
    if (exists) {
      throw DomainException.of(`Client with CPF/CNPJ ${input.cpfCnpj} already exists`);
    }

    const client = new Client({
      name: input.name,
      cpfCnpj: input.cpfCnpj,
      email: input.email,
      phone: input.phone,
    });

    await this.clientRepository.save(client);

    return ClientResponseDto.fromDomain(client);
  }
}
