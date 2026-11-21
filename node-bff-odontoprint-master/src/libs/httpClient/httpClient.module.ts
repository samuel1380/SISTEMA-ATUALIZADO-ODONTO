import { Global, Module } from '@nestjs/common';
import { HttpClient } from './httpClient';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [HttpClient],
  exports: [HttpClient],
})
export class HttpClienteModule { }
