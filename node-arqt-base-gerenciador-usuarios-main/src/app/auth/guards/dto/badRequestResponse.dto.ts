import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class BadRequestResponseDto {
  @ApiProperty()
  @IsInt()
  statusCode: number;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsString()
  message: string;
}

