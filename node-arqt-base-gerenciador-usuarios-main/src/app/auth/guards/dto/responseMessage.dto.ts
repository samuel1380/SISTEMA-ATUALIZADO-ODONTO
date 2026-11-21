import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResponseMessage {
  @ApiProperty()
  @IsString()
  statusCode: number;

  @ApiProperty()
  @IsString()
  message: string;
}