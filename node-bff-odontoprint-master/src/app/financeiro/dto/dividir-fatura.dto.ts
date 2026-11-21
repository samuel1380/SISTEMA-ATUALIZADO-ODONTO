import { IsNotEmpty, IsString, IsArray, IsNumber } from 'class-validator';

export class DividirFaturaDto {
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  idsOrdemServico: number[];
}
