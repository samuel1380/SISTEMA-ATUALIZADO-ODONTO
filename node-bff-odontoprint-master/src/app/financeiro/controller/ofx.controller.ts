import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles, CurrentUser } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { OfxService } from '../business/ofx.service';
import { OptionalParseIntPipe } from '../dto/optional-parse-int';

@Controller('financeiro/ofx')
export class OfxController {
  constructor(private readonly ofxService: OfxService) {}

  @Roles('admin', 'financeiro')
  @Post('importar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importarArquivo(
    @UploadedFile() file: Express.Multer.File,
    @Body('idConta', ParseIntPipe) idConta: number,
    @CurrentUser() currentUser: any,
  ) {
    const idUsuario = currentUser.user?.idUsuario || currentUser.user?.id || 0;
    return this.ofxService.importarArquivoOfx(file, idConta, idUsuario);
  }

  @Roles('admin', 'financeiro')
  @Post('importar-contas-pagar')
  @UseInterceptors(FileInterceptor('arquivo'))
  async importarContasPagar(
    @UploadedFile() file: Express.Multer.File,
    @Body('idCategoria') idCategoriaStr: string,
    @Body('idConta') idContaStr?: string,
  ) {
    const idCategoria = parseInt(String(idCategoriaStr), 10);
    if (Number.isNaN(idCategoria)) {
      throw new BadRequestException('idCategoria inválido.');
    }
    const idConta =
      idContaStr !== undefined && idContaStr !== null && String(idContaStr).trim() !== ''
        ? parseInt(String(idContaStr), 10)
        : undefined;
    if (idConta !== undefined && Number.isNaN(idConta)) {
      throw new BadRequestException('idConta inválido.');
    }
    return this.ofxService.importarOfxContasPagar(file, idCategoria, idConta);
  }

  @Roles('admin', 'financeiro')
  @Get('arquivos')
  async listarArquivos(@Query('idConta', OptionalParseIntPipe) idConta?: number) {
    return this.ofxService.listarArquivos(idConta);
  }

  @Roles('admin', 'financeiro')
  @Get('arquivos/:id')
  async buscarArquivo(@Param('id', ParseIntPipe) id: number) {
    return this.ofxService.buscarArquivoPorId(id);
  }

  @Roles('admin')
  @Delete('arquivos/:id')
  async excluirArquivo(@Param('id', ParseIntPipe) id: number) {
    await this.ofxService.excluirArquivo(id);
    return { message: 'Arquivo excluído com sucesso.' };
  }
}
