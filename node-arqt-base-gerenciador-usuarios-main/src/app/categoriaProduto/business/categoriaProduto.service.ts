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
    const nomeLimpo = (categoriaProduto.nome || '').trim();
    if (!nomeLimpo) throw new BadRequest('Nome da categoria é obrigatório');

    const isDesativado = categoriaProduto.ativo === false || categoriaProduto.ativo === 'false' || categoriaProduto.ativo === 0 || categoriaProduto.ativo === '0';
    const ativo = !isDesativado;

    // Evita duplicidade no banco
    const existente = await this.categoriaProdutoRepository.buscarPorNome(nomeLimpo);
    if (existente) {
      if (!existente.ativo && ativo) {
        await this.categoriaProdutoRepository.atualizarCategoriaProduto(existente.idCategoriaProduto, { ativo: true });
      }
      return { idCategoriaProduto: existente.idCategoriaProduto, nome: existente.nome };
    }

    const novoProduto = await this.categoriaProdutoRepository.cadastrarCategoriaProduto({
      nome: nomeLimpo,
      ativo,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 1
    });

    if (!novoProduto) throw new BadRequest('Cadastro inválido');

    const { idCategoriaProduto, nome } = novoProduto;

    return { idCategoriaProduto, nome };
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
