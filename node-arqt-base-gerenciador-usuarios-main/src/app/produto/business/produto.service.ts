import { Injectable } from '@nestjs/common';
import { BadRequest } from 'src/libs/badRequest';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { ProdutoCadastroDto } from '../dto/produtoCadastro.dto';
import { ProdutoRepository } from '../repository/produto.repository';
import { CustomProdutoRepository } from '../repository/customProduto.repository';
import { plainToClass } from 'class-transformer';
import { CustomProduto } from '../domain/customProduto.entity';

@Injectable()
export class ProdutoService {
  constructor(
    private produtoRepository: ProdutoRepository,
    private customProdutoRepository: CustomProdutoRepository,
  ) { }

  async buscarProdutoPorId(produtoId: number) {
    return this.produtoRepository.buscarProdutoPorId(produtoId);
  }

  async buscarProdutosAtivos() {
    const produtos = await this.produtoRepository.buscarProdutosAtivos();

    return produtos.map(produto => {
      produto.preco = produto.preco;
      produto.precoCusto = produto.precoCusto;

      return produto;
    });
  }

  async cadastrarProduto(currentUser: CurrentUserDto, produto: ProdutoCadastroDto) {

    const novoProduto = await this.produtoRepository.cadastrarProduto({
      nome: produto.nome,
      prazoEntregaDias: produto.prazoEntregaDias,
      precoCusto: produto.precoCusto,
      preco: produto.preco,
      idCategoriaProduto: produto.idCategoriaProduto,
      ativo: true,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    if (produto.customProduto?.length) {
      const customProdutos = plainToClass(CustomProduto, produto.customProduto);
      await this.customProdutoRepository.cadastrarCustomProduto(customProdutos);
    }

    if (!novoProduto) throw new BadRequest('Cadastro inválido');

    const { nome } = novoProduto;

    return { nome };
  }

  async editarProduto(currentUser: CurrentUserDto, produtoId: number, produto: ProdutoCadastroDto) {
    const produtoJaExiste = await this.produtoRepository.buscarProdutoPorId(produtoId);

    if (!produtoJaExiste) throw new BadRequest('Erro ao atualizar produto');

    const empresaAtualizada = await this.produtoRepository.atualizarProduto(produtoId, {
      nome: produto.nome,
      prazoEntregaDias: produto.prazoEntregaDias,
      precoCusto: produto.precoCusto,
      preco: produto.preco,
      idCategoriaProduto: produto.idCategoriaProduto,
      ativo: true,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    console.log("=================================", produto.customProduto)
    if (produto.customProduto?.length) {
      let customProdutos = plainToClass(CustomProduto, produto.customProduto);

      customProdutos = customProdutos.map(custom => {
        custom.idUsuarioCadastro= currentUser?.user?.idUsuario || 0
        return custom;
      });

      await this.customProdutoRepository.cadastrarCustomProduto(customProdutos);
    }

    if (!empresaAtualizada) throw new BadRequest('Erro ao atualizar empresa');

    const { nome } = await this.produtoRepository.buscarProdutoPorId(produtoId);;

    return { nome };
  }

}
