import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auto Repair Shop OS Management')
    .setDescription(
      'API para gerenciamento de ordens de serviço de uma oficina mecânica. ' +
        'Sistema completo com gestão de clientes, veículos, peças, orçamentos e ordens de serviço.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação de administradores')
    .addTag('clients', 'Gerenciamento de clientes')
    .addTag('vehicles', 'Gerenciamento de veículos')
    .addTag('parts', 'Gerenciamento de peças e estoque')
    .addTag('service-orders', 'Gerenciamento de ordens de serviço')
    .addTag('budgets', 'Gerenciamento de orçamentos')
    .addTag('consult', 'Consulta pública de OS pelo cliente')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api-docs`);
}
bootstrap();
