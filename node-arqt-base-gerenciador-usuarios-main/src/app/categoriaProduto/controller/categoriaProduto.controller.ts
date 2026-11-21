
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/guards/decorator/currentUser';
import { Roles } from '../../auth/guards/decorator/roles.decorator';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { CategoriaProdutoService } from '../business/categoriaProduto.service';
import { CategoriaProdutoCadastroDto } from '../dto/categoriaProdutoCadastro.dto';

@ApiTags('Categoria Produto')
@Controller('categoriaproduto')
export class CategoriaProdutoController {
  constructor(private categoriaProdutoService: CategoriaProdutoService) { }

  @Roles('admin')
  @Post()
  async cadastrarCategoriaProduto(@CurrentUser() currentUser: CurrentUserDto, @Body() categoriaProdutoCadastroDto: CategoriaProdutoCadastroDto) {
    return this.categoriaProdutoService.cadastrarCategoriaProduto(currentUser, categoriaProdutoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get('ativos')
  async buscarCategoriaProdutoAtivos() {
    return this.categoriaProdutoService.buscarCategoriaProdutosAtivos();
  }

  @Roles('admin')
  @Put(':produtoId')
  async editarCategoriaProduto(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('produtoId', new ParseIntPipe()) produtoId: number,
    @Body() categoriaProdutoCadastroDto: CategoriaProdutoCadastroDto
  ) {
    return this.categoriaProdutoService.editarCategoriaProduto(currentUser, produtoId, categoriaProdutoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get(':produtoId')
  async buscarCategoriaProdutoPorId(
    @Param('produtoId', new ParseIntPipe()) produtoId: number
  ) {
    return this.categoriaProdutoService.buscarCategoriaProdutoPorId(produtoId);
  }
}
