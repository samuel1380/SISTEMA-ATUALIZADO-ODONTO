import { HttpException, HttpStatus } from "@nestjs/common";

export class NotFound extends HttpException {
  constructor(private id: number) {
    super(`${id} não foi encontrado`, HttpStatus.NOT_FOUND);
  }
}
