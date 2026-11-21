import { IsEmail } from 'class-validator';

export class UsuarioEmailAlteracaoSenhaDto {
  @IsEmail()
  email: string;
}
