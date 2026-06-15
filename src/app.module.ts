import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { getTypeOrmConfig } from '@infrastructure/database/typeorm/config/typeorm.config';
import { AuthModule } from '@interfaces/http/auth/auth.module';
import { ClientModule } from '@interfaces/http/client/client.module';
import { ServiceOrderModule } from '@interfaces/http/service-order/service-order.module';
import { PartModule } from '@interfaces/http/part/part.module';
import { ConsultModule } from '@interfaces/http/consult/consult.module';
import { DomainExceptionFilter } from '@interfaces/http/filters/domain-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    AuthModule,
    ClientModule,
    ServiceOrderModule,
    PartModule,
    ConsultModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
