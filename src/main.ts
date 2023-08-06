import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';
// import { config } from 'dotenv';

// config();

async function bootstrap() {
  const PORT = process.env.PORT || 5001;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new I18nValidationExceptionFilter());
  app.enableCors();
  await app.listen(PORT);
  console.log(`App is running on: http://localhost:${PORT}`);
}
bootstrap();
