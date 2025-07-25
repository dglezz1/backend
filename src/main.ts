
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // Cargar variables de entorno antes de crear la app
  require('dotenv').config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Servir archivos estáticos desde /public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('API Cotizaciones Frimousse')
    .setDescription('API para cotizaciones de pasteles, subida de imágenes y generación de PDF')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
