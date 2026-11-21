import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsObject, IsString } from "class-validator";
import { ResponseMessage } from "./responseMessage.dto";

export class UnauthorizedResponseDto {
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
  @IsObject()
  message: ResponseMessage;
}
