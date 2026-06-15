import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RegisterClientUseCase } from '@application/client/register-client.use-case';
import { FindClientUseCase } from '@application/client/find-client.use-case';
import { RegisterClientDto } from '@application/client/dtos/register-client.dto';
import { ClientResponseDto } from '@application/client/dtos/client-response.dto';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientController {
  constructor(
    private readonly registerClient: RegisterClientUseCase,
    private readonly findClient: FindClientUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente registrado com sucesso', type: ClientResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou CPF/CNPJ duplicado' })
  async register(@Body() dto: RegisterClientDto): Promise<ClientResponseDto> {
    return this.registerClient.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, type: [ClientResponseDto] })
  @ApiQuery({ name: 'cpfCnpj', required: false, description: 'Filtrar por CPF/CNPJ' })
  async findAll(@Query('cpfCnpj') cpfCnpj?: string): Promise<ClientResponseDto[]> {
    if (cpfCnpj) {
      const client = await this.findClient.findByCpfCnpj(cpfCnpj);
      return client ? [client] : [];
    }
    return this.findClient.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findById(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.findClient.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }
}
