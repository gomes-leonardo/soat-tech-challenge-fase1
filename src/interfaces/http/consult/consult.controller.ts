import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FindClientUseCase } from '@application/client/find-client.use-case';
import { FindServiceOrderUseCase } from '@application/service-order/find-service-order.use-case';
import { ServiceOrderResponseDto } from '@application/service-order/dtos/service-order-response.dto';
import { RateLimitGuard } from '../guards/rate-limit.guard';

/**
 * Public consult endpoint — no JWT required.
 * Clients verify their identity with clientId + CPF/CNPJ.
 * Returns read-only service order status.
 */
@ApiTags('consult')
@Controller('consult')
@UseGuards(RateLimitGuard)
export class ConsultController {
  constructor(
    private readonly findClient: FindClientUseCase,
    private readonly findServiceOrder: FindServiceOrderUseCase,
  ) {}

  @Get(':clientId')
  @ApiOperation({
    summary: 'Consulta pública de ordens de serviço do cliente',
    description:
      'Endpoint público para o cliente acompanhar o status das suas OS. ' +
      'Requer clientId na URL e CPF/CNPJ como query parameter para verificação de identidade.',
  })
  @ApiQuery({
    name: 'cpf',
    required: true,
    description: 'CPF ou CNPJ do cliente (para verificação)',
  })
  @ApiResponse({ status: 200, type: [ServiceOrderResponseDto] })
  @ApiResponse({ status: 403, description: 'CPF/CNPJ não corresponde ao cliente' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async consultByClient(
    @Param('clientId') clientId: string,
    @Query('cpf') cpf: string,
  ): Promise<ServiceOrderResponseDto[]> {
    const client = await this.findClient.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Verify ownership: CPF/CNPJ must match
    const inputDigits = (cpf || '').replace(/\D/g, '');
    const clientDigits = client.cpfCnpj.replace(/\D/g, '');

    if (inputDigits !== clientDigits) {
      throw new ForbiddenException('CPF/CNPJ does not match this client');
    }

    return this.findServiceOrder.findByClientId(clientId);
  }
}
