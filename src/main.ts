import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

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

  const config = new DocumentBuilder()
    .setTitle('Nest js авторизация')
    .setDescription('Курс из ютуб')
    .setVersion('1.0')
    .setContact(
      'sfilippenko',
      'https://www.youtube.com/watch?v=HT6cm4GoSIw&t=213s',
      'fil_mf@mail.ru',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentFactory, {
    customSiteTitle: 'Nest js авторизация',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
