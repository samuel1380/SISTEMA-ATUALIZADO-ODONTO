import { IsEmail, IsString } from 'class-validator';

export class UsuarioAtivacaoDto {
  @IsEmail()
  email: string;

  @IsString()
  tokenAcesso: string;
}
