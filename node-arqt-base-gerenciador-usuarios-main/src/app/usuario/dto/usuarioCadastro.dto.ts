import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UsuarioCadastroDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  senha: string;

  @IsString()
  tipoUsuario: string;

  @IsBoolean()
  ativo: boolean;

  @IsBoolean()
  bloqueado: boolean;

  @IsString()
  permissoes: string[];

  @IsNumber()
  @IsOptional()
  idUsuarioCadastro: number;
}
