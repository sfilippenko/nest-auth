import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { getSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser(configService.getOrThrow('COOKIE_SECRET')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const result = errors.reduce<Record<string, string[]>>((acc, cur) => {
          acc[cur.property] = Object.values(cur.constraints ?? {});
          return acc;
        }, {});

        return new BadRequestException({
          message: 'Validation failed',
          errors: result,
        });
      },
      stopAtFirstError: false,
    }),
  );

  const swaggerConfig = getSwaggerConfig();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, documentFactory, {
    customSiteTitle: 'Nest js авторизация',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
