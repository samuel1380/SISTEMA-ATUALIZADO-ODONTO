import { IsNumber, IsString } from 'class-validator';

export class TrabalhoComponenteDto {

  @IsNumber()
  idComponente?: number;

  @IsString()
  nome: string;

}
