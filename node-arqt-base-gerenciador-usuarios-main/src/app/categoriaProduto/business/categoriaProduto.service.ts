import { Injectable } from '@nestjs/common';
import { BadRequest } from 'src/libs/badRequest';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { CategoriaProdutoCadastroDto } from '../dto/categoriaProdutoCadastro.dto';
import { CategoriaProdutoRepository } from '../repository/categoriaProduto.repository';

@Injectable()
export class CategoriaProdutoService {
  constructor(
    private categoriaProdutoRepository: CategoriaProdutoRepository
  ) { }

  async buscarCategoriaProdutoPorId(produtoId: number) {
    return this.categoriaProdutoRepository.buscarCategoriaProdutoPorId(produtoId);
  }

  async buscarCategoriaProdutosAtivos() {
    return await this.categoriaProdutoRepository.buscarCategoriaProdutosAtivos();
  }

  async cadastrarCategoriaProduto(currentUser: CurrentUserDto, categoriaProduto: CategoriaProdutoCadastroDto) {

    const novoProduto = await this.categoriaProdutoRepository.cadastrarCategoriaProduto({
      nome: categoriaProduto.nome,
      ativo: categoriaProduto.ativo,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    if (!novoProduto) throw new BadRequest('Cadastro inválido');

    const { nome } = novoProduto;

    return { nome };
  }

  async editarCategoriaProduto(currentUser: CurrentUserDto, produtoId: number, categoriaProduto: CategoriaProdutoCadastroDto) {
    const categoriaProdutoInexistente = await this.categoriaProdutoRepository.buscarCategoriaProdutoPorId(produtoId);

    if (!categoriaProdutoInexistente) throw new BadRequest('Erro ao atualizar produto');

    const empresaAtualizada = await this.categoriaProdutoRepository.atualizarCategoriaProduto(produtoId, {
      nome: categoriaProduto.nome,
      ativo: categoriaProduto.ativo,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0
    });

    if (!empresaAtualizada) throw new BadRequest('Erro ao atualizar empresa');

    const { nome } = await this.categoriaProdutoRepository.buscarCategoriaProdutoPorId(produtoId);;

    return { nome };
  }

}
