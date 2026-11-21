import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateFaturaDto {
  @IsInt()
  @IsNotEmpty()
  idEmpresa: number;

  @IsString()
  @IsNotEmpty()
  dataInicio: string;

  @IsString()
  @IsNotEmpty()
  dataFim: string;
}
