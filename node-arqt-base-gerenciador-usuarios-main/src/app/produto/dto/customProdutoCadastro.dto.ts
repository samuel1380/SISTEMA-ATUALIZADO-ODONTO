import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomProdutoCadastroDto {
  @IsOptional()
  @IsNumber()
  idCustomProduto?: number;

  @IsNumber()
  idProduto: number;

  @IsString()
  customName: string;

  @IsString()
  customValue: string;

  @IsBoolean()
  ativo: Boolean;
}
