import { Module } from '@nestjs/common';
import { ConsultController } from './consult.controller';
import { ClientModule } from '../client/client.module';
import { ServiceOrderModule } from '../service-order/service-order.module';

@Module({
  imports: [ClientModule, ServiceOrderModule],
  controllers: [ConsultController],
})
export class ConsultModule {}
