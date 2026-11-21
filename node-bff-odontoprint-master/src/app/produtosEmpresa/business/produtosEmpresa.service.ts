import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEmpresa } from '../domain/produtosCategoriaEmpresa.entity';
import { ProdutoEmpresaDto } from '../dto/produtosEmpresa.dto';

@Injectable()
export class ProdutoEmpresaService {
  constructor(
    @InjectRepository(ProdutoEmpresa)
    private readonly produtoEmpresaRepository: Repository<ProdutoEmpresa>,
  ) {}

  /**
   * Sincroniza os produtos associados a uma empresa.
   * Remove os que não estão na lista e adiciona/mantém os que estão.
   */
  async sincronizarProdutosEmpresa(
    currentUser: any,
    idEmpresa: number,
    produtosDto: ProdutoEmpresaDto[],
  ): Promise<ProdutoEmpresa[]> {
    const produtosAtuais = await this.produtoEmpresaRepository.find({
      where: { idEmpresa },
    });

    const idsProdutosDto = produtosDto.map((p) => p.idProduto);

    // 1. Identificar e remover produtos que não estão mais na lista
    const produtosParaRemover = produtosAtuais.filter(
      (p) => !idsProdutosDto.includes(p.idProduto),
    );
    if (produtosParaRemover.length > 0) {
      await this.produtoEmpresaRepository.remove(produtosParaRemover);
    }

    // 2. Criar ou atualizar os produtos da lista
    const produtosParaSalvar = produtosDto.map((dto) => {
      const produtoExistente = produtosAtuais.find(
        (p) => p.idProduto === dto.idProduto,
      );
      return this.produtoEmpresaRepository.create({
        idProdutoEmpresa: produtoExistente?.idProdutoEmpresa, // Reutiliza o ID se já existir para forçar um update
        idEmpresa,
        idProduto: dto.idProduto,
        ativo: 1,
        idUsuarioCadastro: currentUser.user.idUsuario,
      });
    });

    return this.produtoEmpresaRepository.save(produtosParaSalvar);
  }

  async buscarProdutosPorEmpresa(idEmpresa: number): Promise<ProdutoEmpresa[]> {
    return this.produtoEmpresaRepository.find({ where: { idEmpresa } });
  }

  async buscarProdutoEspecifico(idEmpresa: number, idProduto: number): Promise<ProdutoEmpresa | null> {
    return this.produtoEmpresaRepository.findOne({ where :{ idEmpresa, idProduto } });
  }

}

