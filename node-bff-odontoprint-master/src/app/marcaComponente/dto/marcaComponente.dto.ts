import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MarcaComponenteDto {

  @IsOptional()
  @IsNumber()
  idMarcaComponente?: number;

  @IsString()
  nome: string;
}
