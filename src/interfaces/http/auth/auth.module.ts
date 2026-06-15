import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '@infrastructure/auth/jwt.strategy';
import { AdminRepository } from '@domain/admin/admin-repository.port';
import { AdminTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/admin.typeorm-repository';
import { AdminOrmEntity } from '@infrastructure/database/typeorm/entities/admin.orm-entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([AdminOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret-key-do-not-use-in-production'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: AdminRepository,
      useClass: AdminTypeOrmRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
