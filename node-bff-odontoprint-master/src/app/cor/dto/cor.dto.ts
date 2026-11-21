import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CorDto {

  @IsOptional()
  @IsNumber()
  idCor?: number;

  @IsString()
  nome: string;

}
