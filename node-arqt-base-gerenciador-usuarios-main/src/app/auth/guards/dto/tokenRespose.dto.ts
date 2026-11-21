import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class TokenResponseDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  nomeUsuario: string;

  @ApiProperty()
  @IsString()
  idUsuario: string;

  @ApiProperty()
  @IsArray()
  roles: Array<string>;
}
