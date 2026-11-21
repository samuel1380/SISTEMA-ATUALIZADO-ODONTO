import { IsNumber, IsOptional } from 'class-validator';

export class CorEmpresaDto {

  @IsOptional()
  @IsNumber()
  idCorEmpresa?: number;

  @IsNumber()
  idCor: number;

}
