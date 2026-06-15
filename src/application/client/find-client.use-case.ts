import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@domain/client/client-repository.port';
import { ClientResponseDto } from './dtos/client-response.dto';

@Injectable()
export class FindClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async findById(id: string): Promise<ClientResponseDto | null> {
    const client = await this.clientRepository.findById(id);
    if (!client) return null;
    return ClientResponseDto.fromDomain(client);
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<ClientResponseDto | null> {
    const digits = cpfCnpj.replace(/\D/g, '');
    const client = await this.clientRepository.findByCpfCnpj(digits);
    if (!client) return null;
    return ClientResponseDto.fromDomain(client);
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepository.findAll();
    return clients.map(ClientResponseDto.fromDomain);
  }
}
