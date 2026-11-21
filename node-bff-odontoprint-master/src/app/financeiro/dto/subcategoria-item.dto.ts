import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubcategoriaItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}
