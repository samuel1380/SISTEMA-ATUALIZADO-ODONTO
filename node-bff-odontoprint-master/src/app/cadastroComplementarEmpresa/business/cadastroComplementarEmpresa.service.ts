import { ProdutoService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist';
import { Injectable } from '@nestjs/common';
import { ComponenteService } from '../../componente/business/componente.service';
import { ComponenteEmpresaService } from '../../componenteEmpresa/business/componenteEmpresa.service';
import { CorService } from '../../cor/business/cor.service';
import { CorEmpresaService } from '../../corEmpresa/business/corEmpresa.service';
import { DentistaService } from '../../dentista/business/dentista.service';
import { ProdutoEmpresaService } from '../../produtosEmpresa/business/produtosEmpresa.service';
import { CadastroComplementarEmpresa } from '../domain/cadastroComplementarEmpresa.entity';
import { CadastroComplementarEmpresaDto } from '../dto/produtoEmpresa.dto';
import { CadastroComplementarEmpresaRepository } from '../repository/cadastroComplementarEmpresa.repository';
import { Dentista } from '@src/app/dentista/domain/dentista.entity';
import { TabelaPrecoProdutoService } from '@src/app/tabelaPrecoProduto/business/tabelaPrecoProduto.service';

const CACHE_CADASTRO_TTL_MS = 10_000; // 10 segundos - evita buscas repetidas no recálculo de faturas
const CACHE_CADASTRO_MAX_SIZE = 50; // Limite para não crescer memória indefinidamente

@Injectable()
export class CadastroComplementarEmpresaService {
  private readonly cacheCadastro = new Map<number, { data: CadastroComplementarEmpresa; expires: number }>();

  /** Remove entradas expiradas e, se ainda estiver cheio, remove as mais antigas. */
  private limparCacheCadastro(): void {
    const now = Date.now();
    for (const [key, entry] of this.cacheCadastro.entries()) {
      if (entry.expires < now) this.cacheCadastro.delete(key);
    }
    if (this.cacheCadastro.size > CACHE_CADASTRO_MAX_SIZE) {
      const entradasOrdenadas = [...this.cacheCadastro.entries()].sort((a, b) => a[1].expires - b[1].expires);
      const remover = entradasOrdenadas.length - CACHE_CADASTRO_MAX_SIZE;
      for (let i = 0; i < remover; i++) this.cacheCadastro.delete(entradasOrdenadas[i][0]);
    }
  }

  constructor(
    private cadastroComplementarEmpresaRepository: CadastroComplementarEmpresaRepository,
    private produtoEmpresaService: ProdutoEmpresaService,
    private componenteEmpresaService: ComponenteEmpresaService,
    private corEmpresaService: CorEmpresaService,
    private dentistaService: DentistaService,
    private produtoService: ProdutoService,
    private componenteService: ComponenteService,
    private corService: CorService,
    private tabelaPrecoProdutoService: TabelaPrecoProdutoService
  ) { }

  async cadastroComplementarEmpresa(currentUser: any, idEmpresa: number, cadastroComplementarEmpresaDto: CadastroComplementarEmpresaDto) {

    const cadastroComplementarEmpresa = new CadastroComplementarEmpresa();

    cadastroComplementarEmpresa.idCadastroComplementarEmpresa = idEmpresa;
    cadastroComplementarEmpresa.idEmpresa = idEmpresa;
    cadastroComplementarEmpresa.porcentagemDesconto = cadastroComplementarEmpresaDto.porcentagemDesconto || 0;
    cadastroComplementarEmpresa.scannerProprio = cadastroComplementarEmpresaDto.scannerProprio;
    cadastroComplementarEmpresa.utilizaInterfaces = cadastroComplementarEmpresaDto.utilizaInterfaces;
    cadastroComplementarEmpresa.diaPagamento = cadastroComplementarEmpresaDto.diaPagamento;
    cadastroComplementarEmpresa.tipoPagamento = cadastroComplementarEmpresaDto.tipoPagamento;
    cadastroComplementarEmpresa.ativo = 1;
    cadastroComplementarEmpresa.idUsuarioCadastro = currentUser.user.idUsuario;
    cadastroComplementarEmpresa.idTabelaPrecoProduto = cadastroComplementarEmpresaDto.idTabelaPrecoProduto;

    const cadastroComplementar = this.cadastroComplementarEmpresaRepository.salvaCadastroComplementar(cadastroComplementarEmpresa);
    this.cacheCadastro.delete(idEmpresa);

    await this.produtoEmpresaService.sincronizarProdutosEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto.produtos);
    await this.componenteEmpresaService.sincronizarComponentesEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto.componentes);

    // if (cadastroComplementarEmpresaDto.cores?.length) {
    //   this.corEmpresaService.cadastrarCorEmpresa(currentUser, idEmpresa, cadastroComplementarEmpresaDto.cores);
    // } else {
    //   this.corEmpresaService.removeCorEmpresa(idEmpresa, []);
    // }

    const dentistasCadastrados = await this.dentistaService.buscaDentistaPorEmpresaId(idEmpresa.toString());
    if (cadastroComplementarEmpresaDto.dentistas?.length) {

      for await (const dentista of cadastroComplementarEmpresaDto.dentistas) {
        const dentistaCadastrado = this.findDentista(dentistasCadastrados, dentista.email);
        dentista.idEmpresa = idEmpresa.toString();
        dentista.idDentista = dentistaCadastrado && dentistaCadastrado.idDentista;

        
        if (!dentista.idDentista) {
          await this.dentistaService.cadastrarDentista(currentUser, idEmpresa, dentista);
        } else {
          await this.dentistaService.atualizaDentista(currentUser, idEmpresa, dentista);
        }
      }

      const dentistasParaRemoverEmpresa = dentistasCadastrados.filter(dentistaCadastrado => {
        return !cadastroComplementarEmpresaDto.dentistas.some(dentistaCadastroComplementar => dentistaCadastrado.email === dentistaCadastroComplementar.email);
      });

      for await (const dentistaRemover of dentistasParaRemoverEmpresa) {
        await this.dentistaService.desativarDentista(idEmpresa, dentistaRemover.idDentista);
      }
    } else {
      for await (const dentistaRemover of dentistasCadastrados) {
        await this.dentistaService.desativarDentista(idEmpresa, dentistaRemover.idDentista);
      }
    }

    return cadastroComplementar;
  }

  async buscarCadastroComplementarEmpresa(idEmpresa: number): Promise<CadastroComplementarEmpresa> {
    this.limparCacheCadastro();
    const now = Date.now();
    const cached = this.cacheCadastro.get(idEmpresa);
    if (cached && cached.expires > now) return cached.data;
    const data = await this.cadastroComplementarEmpresaRepository.buscarCadastroComplementarEmpresa(idEmpresa);
    this.cacheCadastro.set(idEmpresa, { data, expires: now + CACHE_CADASTRO_TTL_MS });
    return data;
  }

  async buscarInfosCadastroComplementar() {
    const produtos = await this.produtoService.buscarProdutosAtivos();
    const componentes = await this.componenteService.buscaComponentesAtivos();
    const cores = await this.corService.buscaCores();
    const tabelaPrecoProduto = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutos();

    return {
      produtos,
      componentes,
      cores,
      tabelaPrecoProduto
    }
  }

  private findDentista(dentistasCadastrados: Dentista[], dentistaEmail: string) {
    const dentista = dentistasCadastrados.filter(dentista => dentista.email === dentistaEmail);

    return dentista && dentista[0];
  }

  async atualizarPagamento(idEmpresa: number, diaPagamento: number, tipoPagamento: string, quantidadeParcelas: number) {
    let cadastro = await this.cadastroComplementarEmpresaRepository.buscarCadastroComplementarEmpresa(idEmpresa);
    if (!cadastro) {
      cadastro = new CadastroComplementarEmpresa();
      cadastro.idCadastroComplementarEmpresa = idEmpresa;
      cadastro.idEmpresa = idEmpresa;
      cadastro.ativo = 1;
      cadastro.idUsuarioCadastro = 1; // Or somehow get the current user, but since this is just an update we can assume it exists usually
      cadastro.idTabelaPrecoProduto = 1;
    }
    
    cadastro.diaPagamento = diaPagamento;
    cadastro.tipoPagamento = tipoPagamento;
    cadastro.quantidadeParcelas = quantidadeParcelas;
    
    const saved = await this.cadastroComplementarEmpresaRepository.salvaCadastroComplementar(cadastro);
    this.cacheCadastro.delete(idEmpresa);
    return saved;
  }
}
