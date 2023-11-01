// import { RqmService } from './../../../libs/common/src/rmq/rmq.service';
import { NestFactory } from '@nestjs/core';
import { RqmService } from '@app/common';
import { BillingModule } from './billing.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);
  const rqmService = app.get<RqmService>(RqmService);
  app.connectMicroservice(rqmService.getOptions('BILLING'));
  await app.startAllMicroservices();
}
bootstrap();
