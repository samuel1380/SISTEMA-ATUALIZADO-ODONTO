
import { CurrentUser, Roles } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProdutoService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';

@ApiTags('Produto')
@Controller('produto')
export class ProdutoController {
  constructor(private produtoService: ProdutoService) { }

  @Roles('admin', 'comum', 'producao', 'vendas', 'financeiro')
  @Get('ativos')
  async buscarProdutosAtivos() {
    return this.produtoService.buscarProdutosAtivos();
  }
}
