
import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/guards/decorator/currentUser';
import { Roles } from '../../auth/guards/decorator/roles.decorator';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { ProdutoService } from '../business/produto.service';
import { ProdutoCadastroDto } from '../dto/produtoCadastro.dto';

@ApiTags('Produto')
@Controller('produto')
export class ProdutoController {
  constructor(private produtoService: ProdutoService) { }

  @Roles('admin')
  @Post()
  async cadastrarProduto(@CurrentUser() currentUser: CurrentUserDto, @Body() produtoCadastroDto: ProdutoCadastroDto) {
    return this.produtoService.cadastrarProduto(currentUser, produtoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get('ativos')
  async buscarProdutosAtivos() {
    return this.produtoService.buscarProdutosAtivos();
  }

  @Roles('admin')
  @Put(':produtoId')
  async editarProduto(
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('produtoId', new ParseIntPipe()) produtoId: number,
    @Body() produtoCadastroDto: ProdutoCadastroDto
  ) {
    return this.produtoService.editarProduto(currentUser, produtoId, produtoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get(':produtoId')
  async buscarProdutoPorId(
    @Param('produtoId', new ParseIntPipe()) produtoId: number
  ) {
    return this.produtoService.buscarProdutoPorId(produtoId);
  }
}
