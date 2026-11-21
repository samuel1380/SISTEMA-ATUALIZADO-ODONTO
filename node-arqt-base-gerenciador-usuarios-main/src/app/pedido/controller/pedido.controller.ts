
import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/guards/decorator/currentUser';
import { Roles } from '../../auth/guards/decorator/roles.decorator';
import { CurrentUserDto } from '../../auth/guards/dto/currentUser.dto';
import { PedidoService } from '../business/pedido.service';
import { ItemPedidoEditarDto } from '../dto/itemPedidoEditar.dto';
import { PedidoCadastroDto } from '../dto/pedidoCadastro.dto';

@ApiTags('Pedido')
@Controller('pedido')
export class PedidoController {
  constructor(private produtoService: PedidoService) { }

  // TODO: Resolver quando é administrador, deixar a busca para todos os pedidos

  @Roles('admin', 'comum')
  @Post()
  async cadastrarPedido(
    @Headers('idEmpresa') idEmpresa: number,
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() pedidoCadastroDto: PedidoCadastroDto
  ) {
    return this.produtoService.cadastrarPedido(idEmpresa, currentUser, pedidoCadastroDto);
  }

  @Roles('admin', 'comum')
  @Get()
  async buscarPedidos(
    @Headers('idEmpresa') idEmpresa: number,
    @CurrentUser() currentUser: CurrentUserDto
  ) {
    console.log(idEmpresa)
    return this.produtoService.buscarPedidos(idEmpresa, currentUser);
  }

  @Roles('admin', 'comum')
  @Put(':itemPedidoId')
  async editarProduto(
    @Headers('idEmpresa') idEmpresa: number,
    @CurrentUser() currentUser: CurrentUserDto,
    @Param('itemPedidoId', new ParseIntPipe()) itemPedidoId: number,
    @Body() itemPedidoEditarDto: ItemPedidoEditarDto
  ) {
    return this.produtoService.editarPedido(idEmpresa, currentUser, itemPedidoId, itemPedidoEditarDto);
  }

  @Roles('admin', 'comum')
  @Get(':pedidoId')
  async buscarProdutoPorId(
    @Headers('idEmpresa') idEmpresa: number,
    @Param('pedidoId', new ParseIntPipe()) pedidoId: number
  ) {
    return this.produtoService.buscarPedidoPorId(idEmpresa, pedidoId);
  }
}
