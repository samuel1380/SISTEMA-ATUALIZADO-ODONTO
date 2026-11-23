import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetarSenhaDto {
  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'A senha deve ter pelo menos 4 caracteres' })
  novaSenha?: string;
}
