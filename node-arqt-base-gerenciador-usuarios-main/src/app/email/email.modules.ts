import { Module } from '@nestjs/common';
import { EmailService } from './business/email.service';
import { S3Module } from '../s3/s3.module';
import { HttpClienteModule } from 'src/libs/httpClient/httpClient.module';

@Module({
  imports: [
    S3Module.forRoot({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      privateKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.AWS_ENDPOINT
    }),
    HttpClienteModule
  ],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
