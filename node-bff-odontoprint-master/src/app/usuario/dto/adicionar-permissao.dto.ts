import { IsString, IsNotEmpty } from 'class-validator';

export class AdicionarPermissaoDto {
  @IsString()
  @IsNotEmpty()
  permissao: string;
}
