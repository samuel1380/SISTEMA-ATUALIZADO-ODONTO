import { IsNotEmpty, IsNumber, Min, IsDateString, IsOptional, IsString, IsArray } from 'class-validator';

export class LancarValorFaturaDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  valor: number;

  @IsNotEmpty()
  @IsNumber()
  idConta: number;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @IsOptional()
  @IsString()
  meioPagamento?: string;

  @IsOptional()
  @IsArray()
  parcelas?: {
      valor: number;
      dataVencimento: string;
  }[];
}

