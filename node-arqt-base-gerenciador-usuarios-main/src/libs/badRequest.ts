import { HttpException, HttpStatus } from "@nestjs/common";

export class BadRequest extends HttpException {
  constructor(private mensagem: string) {
    super(mensagem, HttpStatus.BAD_REQUEST);
  }
}
