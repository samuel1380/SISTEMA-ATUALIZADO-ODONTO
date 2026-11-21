import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    __dirname + '/../**/*.entity{.ts,.js}',
    './node_modules/@hunter-solucoes/**/*.entity{.ts,.js}',
    '../../node_modules/@hunter-solucoes/**/*.entity{.ts,.js}',
    '../node-arqt-base-gerenciador-usuarios-main/dist/**/*.entity{.ts,.js}',
  ],
  synchronize: false,
  keepConnectionAlive: true,
  // logging: true,
  connectTimeout: 10000000,
  acquireTimeout: 10000000,
  logging: ['error'],
};
  