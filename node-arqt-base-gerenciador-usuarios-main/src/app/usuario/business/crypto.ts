import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class Criptografia {
  criptografaTexto(texto: string): string {
    console.log("process.env.CHAVE_SECRETA", process.env.CHAVE_SECRETA)
    return crypto.createHmac('sha256', process.env.CHAVE_SECRETA).update(texto).digest('hex');
  }
}
