import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';
import { FornecedorService } from '../business/fornecedor.service';
import { CreateFornecedorDto } from '../dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from '../dto/update-fornecedor.dto';

@Controller('financeiro/fornecedores')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @Roles('admin', 'financeiro')
  @Post()
  criar(@Body() dto: CreateFornecedorDto) {
    return this.fornecedorService.criar(dto);
  }

  @Roles('admin', 'financeiro')
  @Get()
  listar(@Query('ativo') ativo?: string) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.fornecedorService.listar(ativoBool);
  }

  @Roles('admin', 'financeiro')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.fornecedorService.buscarPorId(id);
  }

  @Roles('admin', 'financeiro')
  @Put(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFornecedorDto,
  ) {
    return this.fornecedorService.atualizar(id, dto);
  }

  @Roles('admin', 'financeiro')
  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.fornecedorService.excluir(id);
  }
}
