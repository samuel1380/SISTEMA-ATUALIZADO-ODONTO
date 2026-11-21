import { IsEmail, IsString } from 'class-validator';

export class UsuarioAlteracaoSenhaDto {
  @IsEmail()
  email: string;

  @IsString()
  novaSenha: string;

  @IsString()
  tokenAcesso: string;
}
