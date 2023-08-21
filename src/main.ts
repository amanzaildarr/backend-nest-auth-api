import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';

async function bootstrap() {
  const PORT = process.env.PORT || 5001;

  // Create a NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Configure global validation settings using ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // set whitelist is true to ignore fields that are not defined in dto's
      disableErrorMessages: process.env.NODE_ENV !== 'development', // to enable/disable detailed errors
    }),
  );

  // Apply the I18nValidationExceptionFilter globally for validation exceptions
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  app.enableCors();

  // Start the application and listen on the specified port
  await app.listen(PORT);
  console.log(`App is running on: ${await app.getUrl()}`);
}

bootstrap();
