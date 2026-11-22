import { IsOptional, IsString } from 'class-validator';

export class CategoriaProdutoCadastroDto {
  @IsString()
  nome: string;

  @IsOptional()
  ativo?: any;
}

