import { IsNumber, IsString } from 'class-validator';

export class DentesTrabalhoDto {
  @IsNumber()
  denteNumber: number;

  @IsNumber()
  idComponente: number;
  
  @IsNumber()
  idMarca: number;
  
  @IsNumber()
  idProduto: number;
  
  @IsString()
  idScanBody: number;
}
