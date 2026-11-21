import { IsInt, IsNotEmpty } from 'class-validator';

export class ImportarOfxDto {
  @IsInt()
  @IsNotEmpty()
  idConta: number;
}
