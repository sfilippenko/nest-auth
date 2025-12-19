import { DocumentBuilder } from '@nestjs/swagger';

export const getSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Nest js авторизация')
    .setDescription('Курс из ютуб')
    .setVersion('1.0')
    .setContact(
      'sfilippenko',
      'https://www.youtube.com/watch?v=HT6cm4GoSIw&t=213s',
      'fil_mf@mail.ru',
    )
    .build();
};
