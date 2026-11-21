import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class AtualizarDescontoFaturaDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'O desconto não pode ser negativo' })
  desconto: number;
}

