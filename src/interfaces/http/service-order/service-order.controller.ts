import {
  Controller,
  Post,
  Get,
  Patch,
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
import { CreateServiceOrderUseCase } from '@application/service-order/create-service-order.use-case';
import { ChangeServiceOrderStatusUseCase } from '@application/service-order/change-service-order-status.use-case';
import { FindServiceOrderUseCase } from '@application/service-order/find-service-order.use-case';
import { CreateServiceOrderDto } from '@application/service-order/dtos/create-service-order.dto';
import { ChangeStatusDto } from '@application/service-order/dtos/change-status.dto';
import { ServiceOrderResponseDto } from '@application/service-order/dtos/service-order-response.dto';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';

@ApiTags('service-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly createServiceOrder: CreateServiceOrderUseCase,
    private readonly changeStatus: ChangeServiceOrderStatusUseCase,
    private readonly findServiceOrder: FindServiceOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova ordem de serviço' })
  @ApiResponse({ status: 201, type: ServiceOrderResponseDto })
  async create(@Body() dto: CreateServiceOrderDto): Promise<ServiceOrderResponseDto> {
    return this.createServiceOrder.execute(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status da ordem de serviço' })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<ServiceOrderResponseDto> {
    return this.changeStatus.execute({
      serviceOrderId: id,
      newStatus: dto.status,
      changedBy: dto.changedBy,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar ordens de serviço' })
  @ApiQuery({ name: 'status', required: false, enum: ServiceOrderStatus })
  @ApiQuery({ name: 'clientId', required: false })
  async findAll(
    @Query('status') status?: ServiceOrderStatus,
    @Query('clientId') clientId?: string,
  ): Promise<ServiceOrderResponseDto[]> {
    if (status) return this.findServiceOrder.findByStatus(status);
    if (clientId) return this.findServiceOrder.findByClientId(clientId);
    return this.findServiceOrder.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem de serviço por ID' })
  @ApiResponse({ status: 200, type: ServiceOrderResponseDto })
  @ApiResponse({ status: 404 })
  async findById(@Param('id') id: string): Promise<ServiceOrderResponseDto> {
    const so = await this.findServiceOrder.findById(id);
    if (!so) throw new NotFoundException('Service order not found');
    return so;
  }
}
