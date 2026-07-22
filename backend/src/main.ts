import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.enableCors({
    origin: nodeEnv === 'development' ? '*' : frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`server running on port ${port} at /api/v1`);
}

bootstrap();
