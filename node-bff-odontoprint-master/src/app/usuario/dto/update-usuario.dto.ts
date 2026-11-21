import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  tipoUsuario?: string;
}
