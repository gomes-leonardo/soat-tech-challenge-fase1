import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { AdminRepository } from '@domain/admin/admin-repository.port';
import { Admin } from '@domain/admin/admin.entity';
import { DomainException } from '@domain/shared';

class LoginDto {
  @ApiProperty({ example: 'admin@oficina.com', description: 'Email do administrador' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'admin123', description: 'Senha do administrador' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

class RegisterAdminDto {
  @ApiProperty({ example: 'Vinicius Admin', description: 'Nome do administrador' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'admin@oficina.com', description: 'Email do administrador' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'admin123', description: 'Senha (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;
}

class RegisterResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminRepository: AdminRepository,
  ) {
    this.seedDefaultAdmin();
  }

  /**
   * Cria o admin padrão se não existir (projeto acadêmico).
   * Email: admin@oficina.com | Senha: admin123
   */
  private async seedDefaultAdmin(): Promise<void> {
    const exists = await this.adminRepository.existsByEmail('admin@oficina.com');
    if (!exists) {
      const admin = await Admin.create({
        name: 'Admin Padrão',
        email: 'admin@oficina.com',
        password: 'admin123',
      });
      await this.adminRepository.save(admin);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo administrador' })
  @ApiResponse({ status: 201, description: 'Admin registrado', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já existe' })
  async register(@Body() dto: RegisterAdminDto): Promise<RegisterResponseDto> {
    const exists = await this.adminRepository.existsByEmail(dto.email.toLowerCase());
    if (exists) {
      throw DomainException.of(`Admin with email '${dto.email}' already exists`);
    }

    const admin = await Admin.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    await this.adminRepository.save(admin);

    return { id: admin.id, name: admin.name, email: admin.email };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar administrador' })
  @ApiResponse({ status: 200, description: 'JWT token retornado', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const admin = await this.adminRepository.findByEmail(dto.email.toLowerCase());
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await admin.verifyPassword(dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'admin' };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
