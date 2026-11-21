import { IsNumber, IsOptional } from 'class-validator';

export class ComponenteEmpresaDto {

  @IsOptional()
  @IsNumber()
  idComponenteEmpresa?: number;

  @IsNumber()
  idComponente: number;

}
