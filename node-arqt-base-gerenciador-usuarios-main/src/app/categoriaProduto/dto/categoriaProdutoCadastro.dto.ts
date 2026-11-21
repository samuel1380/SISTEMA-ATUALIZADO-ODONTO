import { IsBoolean, IsString } from 'class-validator';

export class CategoriaProdutoCadastroDto {
  @IsString()
  nome: string;

  @IsBoolean()
  ativo: boolean;

}
