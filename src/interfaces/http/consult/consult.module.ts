import { Module } from '@nestjs/common';
import { ConsultController } from './consult.controller';
import { ClientModule } from '../client/client.module';
import { ServiceOrderModule } from '../service-order/service-order.module';
import { RateLimitStore, InMemoryRateLimitStore, RateLimitGuard } from '../guards/rate-limit.guard';

@Module({
  imports: [ClientModule, ServiceOrderModule],
  controllers: [ConsultController],
  providers: [
    {
      // 20 consultas por minuto por cliente — protege o endpoint publico
      // contra abuso/forca-bruta no par clientId + CPF/CNPJ.
      provide: RateLimitStore,
      useFactory: () => new InMemoryRateLimitStore(20, 60_000),
    },
    RateLimitGuard,
  ],
})
export class ConsultModule {}
