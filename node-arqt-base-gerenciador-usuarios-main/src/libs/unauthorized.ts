import { HttpException, HttpStatus } from "@nestjs/common";

export class Unauthorized extends HttpException {
  constructor(private mensagem: string) {
    super(mensagem, HttpStatus.UNAUTHORIZED);
  }
}
