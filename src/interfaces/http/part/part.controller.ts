import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterPartUseCase } from '@application/part/register-part.use-case';
import { AdjustStockUseCase } from '@application/part/adjust-stock.use-case';
import { RegisterPartDto } from '@application/part/dtos/register-part.dto';
import { PartResponseDto } from '@application/part/dtos/part-response.dto';
import { PartRepository } from '@domain/part/part-repository.port';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';

@ApiTags('parts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartController {
  constructor(
    private readonly registerPart: RegisterPartUseCase,
    private readonly adjustStock: AdjustStockUseCase,
    private readonly partRepository: PartRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nova peça' })
  @ApiResponse({ status: 201, type: PartResponseDto })
  async register(@Body() dto: RegisterPartDto): Promise<PartResponseDto> {
    return this.registerPart.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as peças' })
  @ApiResponse({ status: 200, type: [PartResponseDto] })
  async findAll(): Promise<PartResponseDto[]> {
    const parts = await this.partRepository.findAll();
    return parts.map(PartResponseDto.fromDomain);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar peça por ID' })
  @ApiResponse({ status: 200, type: PartResponseDto })
  async findById(@Param('id') id: string): Promise<PartResponseDto> {
    const part = await this.partRepository.findById(id);
    if (!part) throw new NotFoundException('Part not found');
    return PartResponseDto.fromDomain(part);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Ajustar estoque (positivo = entrada, negativo = saída)' })
  @ApiResponse({ status: 200, type: PartResponseDto })
  async stock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<PartResponseDto> {
    return this.adjustStock.execute({ partId: id, quantity });
  }
}
