import { Injectable } from '@nestjs/common';
import { BadRequest } from 'src/libs/badRequest';
import { addDays } from '../../../utils/date.utils';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { ProdutoService } from '../../produto/business/produto.service';
import { Produto } from '../../produto/domain/produto.entity';
import { ItemPedido } from '../domain/itemPedido.entity';
import { ItemPedidoEditarDto } from '../dto/itemPedidoEditar.dto';
import { PedidoCadastroDto } from '../dto/pedidoCadastro.dto';
import { ItemPedidoRepository } from '../repository/itemPedido.repository';
import { PedidoRepository } from '../repository/pedido.repository';

@Injectable()
export class PedidoService {
  constructor(
    private pedidoRepository: PedidoRepository,
    private itemPedidoRepository: ItemPedidoRepository,
    private produtoService: ProdutoService
  ) { }

  async buscarPedidoPorId(idEmpresa: number, pedidoId: number) {
    return this.pedidoRepository.buscarPedidoPorId(idEmpresa, pedidoId);
  }

  async buscarPedidos(idEmpresa: number, currentUser: CurrentUserDto) {
    return await this.pedidoRepository.buscarPedidos(idEmpresa);
  }

  // TODO: Criar um validador se o id da empresa está permitido no usuário

  async cadastrarPedido(idEmpresa: number, currentUser: CurrentUserDto, pedido: PedidoCadastroDto) {

    const itemsPedido: ItemPedido[] = [];
    const idUsuarioSolicitante = currentUser?.user?.idUsuario;

    for await (const itemPedido of pedido.itemsPedido) {
      const produto = await this.produtoService.buscarProdutoPorId(itemPedido.idProduto);

      const itemPedidoNew = new ItemPedido();
      itemPedidoNew.ativo = true;
      itemPedidoNew.status = 'pendente';
      itemPedidoNew.idUsuarioSolicitante = idUsuarioSolicitante;
      itemPedidoNew.produto = produto;
      itemPedidoNew.quantidade = itemPedido.quantidade;
      itemPedidoNew.valor = itemPedido.quantidade * produto.preco;
      itemPedidoNew.prazoEntrega = this.calculaPrazoEntrega(produto);
      itemPedidoNew.idUsuarioCadastro = idUsuarioSolicitante;
      itemPedidoNew.idEmpresa = idEmpresa;

      itemsPedido.push(itemPedidoNew);
    }

    const dataEntregaPedido = itemsPedido.reduce((previous, current) => {
      return current.prazoEntrega > previous && current.prazoEntrega;
    }, new Date())

    const novoPedido = await this.pedidoRepository.cadastrarPedido({
      status: 'pendente',
      idUsuarioSolicitante,
      ativo: true,
      idUsuarioCadastro: currentUser?.user?.idUsuario || 0,
      itemsPedido,
      idEmpresa,
      prazoEntrega: dataEntregaPedido
    });

    if (!novoPedido) throw new BadRequest('Cadastro inválido');

    return novoPedido;
  }


  async editarPedido(idEmpresa: number, currentUser: CurrentUserDto, itemPedidoId: number, itemPedidoEditarDto: ItemPedidoEditarDto) {
    const itemPedidoExiste = await this.itemPedidoRepository.buscarItemPedidoPorId(idEmpresa, itemPedidoId);

    if (!itemPedidoExiste) throw new BadRequest('Erro ao atualizar item pedido');

    const itemPedidoAtualizada = await this.itemPedidoRepository.atualizarItemPedido(idEmpresa, itemPedidoId, {
      status: itemPedidoEditarDto.status,
      idProduto: itemPedidoEditarDto.idProduto,
      quantidade: itemPedidoEditarDto.quantidade,
    });

    if (!itemPedidoAtualizada) throw new BadRequest('Erro ao atualizar item pedido');

    const itemsParaProduzir = await this.itemPedidoRepository.buscarItemPedidoNaoConcluidoOfPedido(itemPedidoExiste.idPedido);

    if(!itemsParaProduzir.length) {
      await this.pedidoRepository.atualizarPedido(idEmpresa, itemPedidoExiste.idPedido, {
        status: 'concluido'
      });
    }

    await this.recalculaPrazoPedido(idEmpresa, itemPedidoExiste.idPedido);

    return this.pedidoRepository.buscarPedidoPorId(idEmpresa, itemPedidoExiste.idPedido)

  }

  async recalculaPrazoPedido(idEmpresa: number, idPedido: number) {
    const novaDataEntrega = await this.calcularDataEntregaPedido(idEmpresa, idPedido);

    this.pedidoRepository.atualizarPedido(idEmpresa, idPedido, {
      prazoEntrega: novaDataEntrega
    })
  }

  async calcularDataEntregaPedido(idEmpresa: number, idPedido: number) {
    const pedido = await this.pedidoRepository.buscarPedidoPorId(idEmpresa, idPedido);

    return pedido.itemsPedido.reduce((previous, current) => {
      return current.prazoEntrega > previous && current.prazoEntrega;
    }, new Date())
  }

  private calculaPrazoEntrega(produto: Produto) {
    const dataEntrega = new Date();

    return addDays(dataEntrega, produto.prazoEntregaDias);
  }

}
