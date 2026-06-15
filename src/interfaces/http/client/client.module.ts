import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientController } from './client.controller';
import { RegisterClientUseCase } from '@application/client/register-client.use-case';
import { FindClientUseCase } from '@application/client/find-client.use-case';
import { ClientRepository } from '@domain/client/client-repository.port';
import { ClientTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/client.typeorm-repository';
import { ClientOrmEntity } from '@infrastructure/database/typeorm/entities/client.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientOrmEntity])],
  controllers: [ClientController],
  providers: [
    RegisterClientUseCase,
    FindClientUseCase,
    {
      provide: ClientRepository,
      useClass: ClientTypeOrmRepository,
    },
  ],
  exports: [ClientRepository, FindClientUseCase],
})
export class ClientModule {}
