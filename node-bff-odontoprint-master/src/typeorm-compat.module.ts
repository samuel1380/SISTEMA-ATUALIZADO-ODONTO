import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

const typeormBFF = require('typeorm');
let typeormBase: any;
try {
  typeormBase = require('@hunter-solucoes/node-arqt-base-gerenciador-usuarios/node_modules/typeorm');
} catch (e) {
  try {
    typeormBase = require('../../node-arqt-base-gerenciador-usuarios-main/node_modules/typeorm');
  } catch (err) {}
}

const providers: any[] = [
  {
    provide: typeormBFF.Connection,
    useExisting: DataSource,
  },
  {
    provide: 'Connection',
    useExisting: DataSource,
  },
  {
    provide: 'defaultConnection',
    useExisting: DataSource,
  },
];

if (typeormBase && typeormBase.Connection && typeormBase.Connection !== typeormBFF.Connection) {
  providers.push({
    provide: typeormBase.Connection,
    useExisting: DataSource,
  });
}

@Global()
@Module({
  providers,
  exports: providers.map(p => p.provide),
})
export class TypeOrmCompatModule {}
