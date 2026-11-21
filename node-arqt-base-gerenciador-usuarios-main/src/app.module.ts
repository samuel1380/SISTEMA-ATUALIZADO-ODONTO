import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './app/auth/auth.module';
import { S3Module } from './app/s3/s3.module';
import { EmailModule } from './app/email/email.modules';
import { HttpClienteModule } from './libs/httpClient/httpClient.module';
import { UsuarioModule } from './app/usuario/usuario.module';
import { PermissaoGeralModule } from './app/permissao/permissaoGeral.module';
import { EmpresaModule } from './app/empresa/empresa.module';
import { ProdutoModule } from './app/produto/produto.module';
import { PedidoModule } from './app/pedido/pedido.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    EmailModule,
    S3Module.forRoot({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      privateKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT
    }),
    UsuarioModule,
    PermissaoGeralModule,
    HttpClienteModule,
    EmpresaModule,
    ProdutoModule,
    PedidoModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
