import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { StatusTrabalho, Trabalho } from '../domain/trabalho.entity';
import { TrabalhoCadastroDto } from '../dto/trabalhoCadastro.dto';
import { TrabalhoEditarDto } from '../dto/trabalhoEditar.dto';
import { TrabalhoRepository } from '../repository/trabalho.repository';
import { plainToClass } from 'class-transformer';
import { TrabalhoStatusEditarDto } from '../dto/trabalhoStatusEditar.dto';
import { ComponenteDto } from '@src/app/componente/dto/componente.dto';
import { ComponentesTrabalhoService } from './componentesTrabalho.service';
import { HistoricoStatusTrabalhoService } from '@src/app/historicoStatusTrabalho/business/historicoStatusTrabalho.service';
import { CadastroComplementarEmpresaService } from '@src/app/cadastroComplementarEmpresa/business/cadastroComplementarEmpresa.service';
import { TabelaPrecoProdutoService } from '@src/app/tabelaPrecoProduto/business/tabelaPrecoProduto.service';
import { EmpresaTabelaPrecoService } from '@src/app/empresaTabelaPreco/business/empresaTabelaPreco.service';
import { CadastroComplementarEmpresa } from '@src/app/cadastroComplementarEmpresa/domain/cadastroComplementarEmpresa.entity';
import { TabelaPrecoProduto } from '@src/app/tabelaPrecoProduto/domain/tabelaPrecoProduto.entity';
import { ComponentesTrabalho } from '../domain/componentesTrabalho.entity';
import { ElementosTrabalho } from '../domain/elementosTrabalho.entity';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TrabalhoCriadoEvent } from '@src/app/estoque/estoque/domain/events/trabalho-criado.events';
import { EstoqueService } from '@src/app/estoque/estoque/service/estoque.service';
import { TransferenciaService } from '@src/app/estoque/transferencia/service/transferencia.service';
import { AlmoxarifadoService } from '@src/app/estoque/almoxarifado/service/almoxarifado.service';
import { CreateTransferenciaDto } from '@src/app/estoque/transferencia/domain/dto/create-transferencia.dto';
import { ServicoTrabalho } from '../domain/servicoTrabalho.entity';
import { OrdemServicoService } from '@src/app/ordemServico/business/ordemServico.service';
import { OrdemServico, StatusOrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import { OrdemServicoItem, StatusOrdemServicoItem, TipoCobranca } from '@src/app/ordemServico/domain/ordemServicoItem.entity';
import { PacienteService } from '@src/app/paciente/business/paciente.service';
import { FaturaService } from '@src/app/financeiro/business/fatura.service';
import { DevolucaoComponenteService } from '@src/app/financeiro/business/devolucao-componente.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TrabalhoMotivo } from '../domain/trabalhoMotivo.entity';
import { Motivo } from '@src/app/motivo/domain/motivo.entity';
import { MotivoTipo } from '@src/app/motivo/dto/motivo.dto';

@Injectable()
export class TrabalhoService {
  constructor(
    private trabalhoRepository: TrabalhoRepository,
    private componentesTrabalhoService: ComponentesTrabalhoService,
    private historicoStatusTrabalhoService: HistoricoStatusTrabalhoService,
    private cadastroComplementarEmpresaService: CadastroComplementarEmpresaService,
    private tabelaPrecoProdutoService: TabelaPrecoProdutoService,
    private empresaTabelaPrecoService: EmpresaTabelaPrecoService,
    private ordemServicoService: OrdemServicoService,
    private eventEmitter: EventEmitter2,
    private estoqueService: EstoqueService,
    private readonly logger: Logger = new Logger(TrabalhoService.name),
    private readonly transferenciaService: TransferenciaService,
    private readonly almoxarifadoService: AlmoxarifadoService,
    private readonly pacienteService: PacienteService,
    private readonly faturaService: FaturaService,
    private readonly devolucaoComponenteService: DevolucaoComponenteService,
    @InjectRepository(OrdemServicoItem)
    private readonly osItemRepository: Repository<OrdemServicoItem>,
    @InjectRepository(TrabalhoMotivo)
    private readonly trabalhoMotivoRepository: Repository<TrabalhoMotivo>,
    @InjectRepository(Motivo)
    private readonly motivoRepository: Repository<Motivo>,
  ) { }

  async emitirEventosTrabalhoEnviado() {
    const trabalhos = await this.trabalhoRepository.buscarTrabalhos([StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA]);

    for (const trabalho of trabalhos) {
      this.logger.log(`Emitindo evento 'trabalho.criado' para o trabalho ID: ${trabalho.idTrabalho}`);
      await this.atualizaEstoque(trabalho.idTrabalho);
    }
    
  }

  async cadastrarTrabalho(currentUser: any, idEmpresa: number, nomeEmpresa: string, trabalhoCadastroDto: TrabalhoCadastroDto) {
    const {
      servicos: servicosDto,
      componentes: componentesDto,
      idPaciente,
      motivosRetrabalhoIds,
      motivosBonificacaoIds,
      ...dadosTrabalhoDto
    } = trabalhoCadastroDto;

    const trabalho: Trabalho = plainToClass(Trabalho, dadosTrabalhoDto);
    trabalho.idEmpresa = idEmpresa;
    trabalho.nomeEmpresa = nomeEmpresa;
    trabalho.ativo = true;
    trabalho.anotacoes = trabalhoCadastroDto.anotacoes;

    // Valida a existência do paciente. A criação agora é responsabilidade de outro fluxo.
    const paciente = await this.pacienteService.findOne(idPaciente, idEmpresa);
    trabalho.idPaciente = paciente.idPaciente;
    trabalho.nomePaciente = paciente.nome;

    trabalho.idUsuarioCadastro = currentUser.user.idUsuario;
    
    // Buscar cadastro complementar da empresa para obter a tabela de preço matriz
    const cadastroComplementar = await this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa);
    if (cadastroComplementar?.idTabelaPrecoProduto) {
      // Buscar tabela de preço vigente baseada na matriz da empresa na data atual
      const dataInclusao = new Date();
      const tabelaPrecoVigente = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(
        cadastroComplementar.idTabelaPrecoProduto,
        dataInclusao
      );
      if (tabelaPrecoVigente) {
        trabalho.idTabelaPrecoProduto = tabelaPrecoVigente.idTabelaPrecoProduto;
        this.logger.log(`[Trabalho] Tabela de preço selecionada: ID ${tabelaPrecoVigente.idTabelaPrecoProduto}, Nome: "${tabelaPrecoVigente.nome}", Matriz: ${cadastroComplementar.idTabelaPrecoProduto}, Data: ${dataInclusao.toISOString()}`);
      } else {
        // Se não encontrou versão vigente, usar a matriz diretamente como fallback
        const tabelaMatriz = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
        if (tabelaMatriz && tabelaMatriz.ativo === 1) {
          trabalho.idTabelaPrecoProduto = tabelaMatriz.idTabelaPrecoProduto;
          this.logger.warn(`[Trabalho] Nenhuma versão vigente encontrada para a matriz ${cadastroComplementar.idTabelaPrecoProduto}, usando a matriz diretamente: ID ${tabelaMatriz.idTabelaPrecoProduto}`);
        } else {
          this.logger.error(`[Trabalho] Nenhuma tabela de preço válida encontrada para a matriz ${cadastroComplementar.idTabelaPrecoProduto}`);
        }
      }
    } else {
      this.logger.warn(`[Trabalho] Empresa ${idEmpresa} não possui tabela de preço configurada no cadastro complementar`);
    }
    
    if (servicosDto) {
      trabalho.servicos = await Promise.all(servicosDto.map(async (servicoDto) => {
        const servico = new ServicoTrabalho();
        servico.idProduto = servicoDto.idProduto;
        servico.elementos = await Promise.all(servicoDto.elementos?.map(async (elDto) => {
          if (elDto.idElementoTrabalho) {
            // Se o elemento já existe, apenas o retornamos para associação.
            return plainToClass(ElementosTrabalho, elDto);
          } else {
            // Se for um novo elemento (sem ID), criamos, salvamos e retornamos a entidade salva.
            const novoElemento = new ElementosTrabalho();
            novoElemento.nome = elDto.nome;
            novoElemento.idUsuarioCadastro = currentUser.user.idUsuario;
            // O TypeORM não tem um repositório direto aqui, então salvamos através da relação.
            // A abordagem mais segura é garantir que o cascade funcione ou salvar explicitamente.
            return novoElemento;
          }
        }) || []);
        return servico;
      }));
    }

    // Filtra componentes para não validar estoque de "Sem Componente"
    const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
    const componentesParaValidarEstoque = componentesDto?.filter(c => !nomesIgnorados.includes(c.nome));
    const componenteIds = componentesParaValidarEstoque?.map(componente => componente.idComponente);
    
    // A lógica original parecia invertida. Corrigido para AGUARDANDO_COMPONENTE se NÃO houver estoque.
    // if (componenteIds && componenteIds.length > 0 && !(await this.estoqueService.hasGlobalStockForComponent(componenteIds))) {
    //   trabalho.status = StatusTrabalho.AGUARDANDO_COMPONENTE;
    // } else {
      trabalho.status = StatusTrabalho.MODELAGEM;
    // }

    const componentes = componentesDto?.reduce((previous, current) => {
      if (previous[current.idComponente]) {
        previous[current.idComponente].qtdItems = previous[current.idComponente].qtdItems + 1;
      } else {
        previous[current.idComponente] = current;
        previous[current.idComponente].qtdItems = 1;
      }
      return previous;
    }, {} as any);
    
    const trabalhosalvo = await this.trabalhoRepository.salvaTrabalho(trabalho);
    
    if (componentes) {
      await this.componentesTrabalhoService.salvarComponentes(Object.values(componentes), trabalhosalvo.idTrabalho);
    }

    await this.validarESincronizarMotivosDoTrabalho(
      trabalhosalvo.idTrabalho,
      !!trabalhosalvo.retrabalho,
      !!trabalhosalvo.bonificacao,
      motivosRetrabalhoIds,
      motivosBonificacaoIds,
    );

    await this.atualizaOrdemServico(currentUser, trabalhosalvo.idTrabalho);
    await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, trabalhosalvo.idTrabalho, StatusTrabalho.PENDENTE, StatusTrabalho.MODELAGEM);

    return this.buscarTrabalhoPorId(trabalhosalvo.idTrabalho);
  }



  async atualizaEstoque(idTrabalho: number) {
    const trabalho = await this.buscarTrabalhoPorId(idTrabalho);
    const componentesConsumo = trabalho.componentes;
    const idEmpresa = trabalho.idEmpresa;
    
    if (!componentesConsumo) return;

    for (const componente of Object.values(componentesConsumo) as any[]) {
      if (!componente.idComponente || !componente.qtdItems) continue;

      let quantidadeNecessaria = componente.qtdItems;
      const idComponente = componente.idComponente;

      // 1. Buscar todos os almoxarifados que possuem o componente em estoque para a empresa
      const estoquesDisponiveis = await this.estoqueService.findStockForComponent(idComponente, idEmpresa);
      const estoquesDisponiveisLaboratorio = await this.estoqueService.findStockForComponent(idComponente, 0);
      let estoquesGlobalDisponiveis = await this.estoqueService.findStockForComponentAllAlmoxarifados(idComponente, idEmpresa);

      estoquesGlobalDisponiveis = estoquesGlobalDisponiveis.concat(estoquesDisponiveisLaboratorio);

      const totalDisponivel = estoquesDisponiveis.reduce((acc, e) => acc + e.quantidade, 0);
      if (totalDisponivel < quantidadeNecessaria) {
        this.logger.warn(`Estoque insuficiente para o componente ${idComponente}. Necessário: ${quantidadeNecessaria}, Disponível: ${totalDisponivel}. Adicionando Débito.`);        
        
        if (false) { // Não estourar erro em caso de não ter o produto em estoque
          throw new UnprocessableEntityException(
            `Estoque insuficiente para o componente ${idComponente}. Necessário: ${quantidadeNecessaria}, Disponível: ${totalDisponivel}`,
          );
        }
      }

      // 2. Debitar dos estoques, começando pelos que têm mais itens (ou outra regra de sua preferência)
      if (totalDisponivel > 0) {
        for (const estoque of estoquesDisponiveis) {
          if (quantidadeNecessaria <= 0) break;

          const quantidadeADebitar = Math.min(estoque.quantidade, quantidadeNecessaria);

          if (quantidadeADebitar > 0) {
            const eventoConsumo: TrabalhoCriadoEvent = {
              idComponente: idComponente,
              idEmpresa: idEmpresa,
              quantidadeConsumida: quantidadeADebitar,
              idTrabalho: idTrabalho,
            };

            this.eventEmitter.emit('trabalho.criado', eventoConsumo);
            quantidadeNecessaria -= quantidadeADebitar;
          }
        }
      }

      const almoxarifadoDestino = await this.almoxarifadoService.findOneByEmpresa(idEmpresa);

      if (quantidadeNecessaria > 0) {

        if (!almoxarifadoDestino) {
          this.logger.error(`Almoxarifado de destino não encontrado para a empresa ${idEmpresa}.`);
          throw new NotFoundException(`Almoxarifado de destino não encontrado para a empresa ${idEmpresa}.`);
        }
        
        for (const estoqueGlobal of estoquesGlobalDisponiveis) {
          if (quantidadeNecessaria <= 0) break;

          const quantidadeADebitar = Math.min(estoqueGlobal.quantidade, quantidadeNecessaria);

          if (quantidadeADebitar > 0) {
            const eventoTransferenciaGlobal: CreateTransferenciaDto = {
              idComponente: idComponente,
              idAlmoxarifadoOrigem: estoqueGlobal.idAlmoxarifado,
              idAlmoxarifadoDestino: almoxarifadoDestino.idAlmoxarifado,
              quantidade: quantidadeADebitar,
            };

            await this.transferenciaService.create(eventoTransferenciaGlobal);
            quantidadeNecessaria -= quantidadeADebitar;
          }  
        }
      }

      if (quantidadeNecessaria > 0) {
        const eventoTransferencia: CreateTransferenciaDto = {
              idComponente: idComponente,
              idAlmoxarifadoDestino: almoxarifadoDestino.idAlmoxarifado,
              quantidade: quantidadeNecessaria,
            };

            await this.transferenciaService.create(eventoTransferencia);
            quantidadeNecessaria -= quantidadeNecessaria;
      }


      if (quantidadeNecessaria > 0) {
        // Esta verificação é uma segurança extra, a lógica inicial já deve prevenir isso.
        throw new Error(
          `Falha na lógica de consumo de estoque para o componente ${idComponente}. Quantidade necessaria = ${quantidadeNecessaria}`,
        );
      }
    }
  }

  async atualizarTrabalho(currentUser: any, idTrabalho: number, trabalhoCadastroDto: Partial<TrabalhoEditarDto>, isAdmin: boolean = false) {
    const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);

    if (!trabalhoDB) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }

    if (trabalhoDB.finalizado) {
      throw new HttpException("Trabalho finalizado não pode ser alterado", HttpStatus.BAD_REQUEST);
    }

    // if (!isAdmin && trabalhoDB.status != StatusTrabalho.PENDENTE) {
    //   throw new HttpException("Trabalho precisa estar pendente", HttpStatus.BAD_REQUEST);
    // }

    // Atualiza as propriedades do trabalho, exceto as relações que serão tratadas separadamente.
    const {
      servicos,
      componentes: componentesDto,
      idPaciente,
      motivosRetrabalhoIds,
      motivosBonificacaoIds,
      ...dadosTrabalho
    } = trabalhoCadastroDto;

    // Lógica para atualizar o paciente
    if (idPaciente && idPaciente !== trabalhoDB.idPaciente) {
      const paciente = await this.pacienteService.findOne(idPaciente, trabalhoDB.idEmpresa);
      trabalhoDB.idPaciente = paciente.idPaciente;
      trabalhoDB.nomePaciente = paciente.nome;
    }

    // Aplica as outras atualizações do DTO
    Object.assign(trabalhoDB, dadosTrabalho);
    trabalhoDB.anotacoes = trabalhoCadastroDto.anotacoes;
    trabalhoDB.idTrabalho = idTrabalho;

    this.validarComponentesDtoIndefinidosProibidosNoStatus(
      trabalhoDB.status,
      trabalhoCadastroDto.componentes,
    );

    if (trabalhoCadastroDto.servicos) {
      const mapaServicosAtuais = new Map(trabalhoDB.servicos?.map(s => [s.idServicoTrabalho, s]));

      trabalhoDB.servicos = await Promise.all(trabalhoCadastroDto.servicos.map(async (servicoDto) => {
        let servico: ServicoTrabalho;

        if (servicoDto.idServicoTrabalho && mapaServicosAtuais.has(servicoDto.idServicoTrabalho)) {
          servico = mapaServicosAtuais.get(servicoDto.idServicoTrabalho);
          servico.idProduto = servicoDto.idProduto;
        } else {
          servico = new ServicoTrabalho();
          servico.idProduto = servicoDto.idProduto;
        }

        servico.elementos = await Promise.all(servicoDto.elementos?.map(async (elDto) => {
          if (elDto.idElementoTrabalho) {
            return plainToClass(ElementosTrabalho, elDto);
          } else {
            const novoElemento = new ElementosTrabalho();
            novoElemento.nome = elDto.nome;
            novoElemento.idUsuarioCadastro = currentUser.user.idUsuario;
            return novoElemento;
          }
        }) || []);

        return servico;
      }));
    } else {
      trabalhoDB.servicos = [];
    }

    const componentes = trabalhoCadastroDto.componentes && trabalhoCadastroDto.componentes.reduce((previous, current) => {
      if (previous[current.idComponente]) {
        previous[current.idComponente].qtdItems = previous[current.idComponente].qtdItems + 1;
      } else {
        previous[current.idComponente] = current;
        previous[current.idComponente].qtdItems = 1;
      }
      previous[current.idComponente].idTrabalho = idTrabalho;
      return previous;
    }, {} as any);

    // Filtra componentes para não validar estoque de "Sem Componente"
    const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
    const componentesParaValidarEstoque = trabalhoCadastroDto.componentes?.filter(c => !nomesIgnorados.includes(c.nome));
    const componenteIds = componentesParaValidarEstoque?.map(componente => componente.idComponente);
    
    // if (componenteIds && componenteIds.length > 0 && !(await this.estoqueService.hasGlobalStockForComponent(componenteIds))) {
    //   trabalhoDB.status = StatusTrabalho.AGUARDANDO_COMPONENTE;
    // }

    trabalhoDB.servicos?.forEach(servico => {
      servico.idTrabalho = idTrabalho;
      servico.elementos?.forEach(elemento => {
        elemento.idUsuarioCadastro = currentUser.user.idUsuario;
      });
    });

    const trabalhosalvo = await this.trabalhoRepository.salvaTrabalho(trabalhoDB);
    await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalho, trabalhoDB.status, StatusTrabalho.MODELAGEM);

    if (componentes !== undefined) {
      await this.componentesTrabalhoService.salvarComponentes(Object.values(componentes), trabalhosalvo.idTrabalho);
    }

    await this.validarESincronizarMotivosDoTrabalho(
      trabalhosalvo.idTrabalho,
      !!trabalhosalvo.retrabalho,
      !!trabalhosalvo.bonificacao,
      motivosRetrabalhoIds,
      motivosBonificacaoIds,
    );

    // Mantém ordem de serviço e itens alinhados ao trabalho (relatórios e financeiro usam a OS)
    await this.atualizaOrdemServico(currentUser, trabalhosalvo.idTrabalho);

    return this.buscarTrabalhoPorId(trabalhosalvo.idTrabalho);
  }

    /**
   * Cria um novo trabalho a partir de um existente para fins de retrabalho.
   * - Cria um novo trabalho com a flag `retrabalho` = true.
   * - Vincula o novo trabalho ao trabalho de origem.
   * - Move os itens (serviços e componentes) especificados do trabalho original para o novo.
   * - Recalcula o financeiro de ambos os trabalhos:
   *   - O novo trabalho de retrabalho terá custo zero.
   *   - O trabalho original terá o valor dos itens movidos deduzido.
   * @param currentUser O usuário logado que está realizando a ação.
   * @param idTrabalhoOrigem O ID do trabalho que está sendo refeito.
   * @param retrabalhoDto DTO contendo os serviços e componentes que fazem parte do retrabalho.
   */
  async criarRetrabalho(currentUser: any, idTrabalhoOrigem: number, retrabalhoDto: TrabalhoCadastroDto) {
    // 1. Buscar trabalho original e validar
    const trabalhoOrigem = await this.buscarTrabalhoPorId(idTrabalhoOrigem);
    if (!trabalhoOrigem) {
      throw new NotFoundException(`Trabalho de origem com ID ${idTrabalhoOrigem} não encontrado.`);
    }

    // 2. Criar a nova entidade de Trabalho para o retrabalho
    const novoTrabalho = new Trabalho();

    // Copiar dados essenciais do trabalho original
    novoTrabalho.nomePaciente = trabalhoOrigem.nomePaciente;
    novoTrabalho.idEmpresa = trabalhoOrigem.idEmpresa;
    novoTrabalho.idPaciente = trabalhoOrigem.idPaciente;
    novoTrabalho.nomeEmpresa = trabalhoOrigem.nomeEmpresa;
    novoTrabalho.idProfissional = trabalhoOrigem.idProfissional;
    novoTrabalho.cor = retrabalhoDto.cor || trabalhoOrigem.cor;
    novoTrabalho.descricaoTrabalho = `Retrabalho do OS: ${trabalhoOrigem.idTrabalho}`;

    // Definir propriedades específicas do retrabalho
    novoTrabalho.idTrabalhoOrigem = idTrabalhoOrigem;
    novoTrabalho.retrabalho = true;
    novoTrabalho.observacao = retrabalhoDto.observacao;
    novoTrabalho.anotacoes = retrabalhoDto.anotacoes;
    novoTrabalho.status = StatusTrabalho.MODELAGEM;
    novoTrabalho.idUsuarioCadastro = currentUser.user.idUsuario;
    novoTrabalho.ativo = true;

    // Mapear DTOs de serviços para entidades
    novoTrabalho.servicos = plainToClass(ServicoTrabalho, retrabalhoDto.servicos);
    novoTrabalho.servicos?.forEach(servico => {
      servico.elementos?.forEach(elemento => {
        elemento.idUsuarioCadastro = currentUser.user.idUsuario;
      });
    });

    // Salvar o novo trabalho (sem componentes ainda para obter o ID)
    const retrabalhoSalvo = await this.trabalhoRepository.salvaTrabalho(novoTrabalho);

    // Processar e salvar os componentes do retrabalho
    const componentesAgrupadosParaRetrabalho = retrabalhoDto.componentes?.reduce((acc, compDto) => {
      const id = compDto.idComponente;
      if (acc[id]) {
        acc[id].qtdItems += 1;
      } else {
        const novoComp = new ComponentesTrabalho();
        novoComp.idComponente = id;
        novoComp.qtdItems = 1;
        acc[id] = novoComp;
      }
      return acc;
    }, {} as { [key: number]: ComponentesTrabalho });

    if (componentesAgrupadosParaRetrabalho) {
      await this.componentesTrabalhoService.salvarComponentes(Object.values(componentesAgrupadosParaRetrabalho), retrabalhoSalvo.idTrabalho);
    }

    // 3. Atualizar o trabalho original removendo os itens que foram para o retrabalho
    const produtosEmRetrabalhoIds = retrabalhoDto.servicos?.map(s => s.idProduto) || [];
    trabalhoOrigem.servicos = trabalhoOrigem.servicos.filter(s => !produtosEmRetrabalhoIds.includes(s.idProduto));

    if (componentesAgrupadosParaRetrabalho) {
      const componentesOriginais = await this.componentesTrabalhoService.buscarPorIdTrabalho(idTrabalhoOrigem);
      Object.values(componentesAgrupadosParaRetrabalho).forEach(compRetrabalho => {
        const compOriginal = componentesOriginais.find(c => c.idComponente === compRetrabalho.idComponente);
        if (compOriginal) {
          compOriginal.qtdItems -= compRetrabalho.qtdItems;
        }
      });
      const componentesFinaisOrigem = componentesOriginais.filter(c => c.qtdItems > 0);
      await this.componentesTrabalhoService.salvarComponentes(componentesFinaisOrigem, idTrabalhoOrigem);
    }
    await this.trabalhoRepository.salvaTrabalho(trabalhoOrigem);

    // 4. Recalcular o financeiro para ambos os trabalhos
    await this.atualizaOrdemServico(currentUser, retrabalhoSalvo.idTrabalho);
    await this.atualizaOrdemServico(currentUser, idTrabalhoOrigem);

    // 5. Adicionar registros no histórico (Opcional: adicionar campo de observação no histórico)
    await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, retrabalhoSalvo.idTrabalho, null, StatusTrabalho.MODELAGEM);
    await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalhoOrigem, trabalhoOrigem.status, trabalhoOrigem.status);

    return this.buscarTrabalhoPorId(retrabalhoSalvo.idTrabalho);
  }

  async atualizarAnotacoesTrabalho(currentUser: any, idTrabalho: number, trabalhoCadastroDto: Partial<TrabalhoEditarDto>) {
    const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);

    if (!trabalhoDB) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }

    if (trabalhoDB.finalizado) {
      throw new HttpException("Trabalho finalizado não pode ter anotações alteradas", HttpStatus.BAD_REQUEST);
    }

    const trabalho: Partial<Trabalho> = {};

    trabalho.idTrabalho = idTrabalho;
    trabalho.anotacoes = trabalhoCadastroDto.anotacoes;
    trabalho.observacao = trabalhoCadastroDto.observacao;

    let recalcular = false;
    if(trabalho.retrabalho != trabalhoCadastroDto.retrabalho) {
      trabalho.retrabalho = trabalhoCadastroDto.retrabalho;
      recalcular = true;
    }

    const trabalhoAtualizado = await this.atualizarTrabalho(currentUser, idTrabalho, trabalhoCadastroDto, true);
    if (recalcular) {
      await this.atualizaOrdemServico(currentUser, idTrabalho);
    }

    return trabalhoAtualizado;
    
  }

  async atualizarStatusTrabalho(currentUser: any, idTrabalho: number, trabalhoStatusEditarDto: TrabalhoStatusEditarDto) {
    const trabalhoDB = await this.trabalhoRepository.buscarProdutoPorIdComRelacoes(idTrabalho);

    if (!trabalhoDB) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }

    if (trabalhoDB.finalizado) {
      throw new HttpException("Trabalho finalizado não pode ter status alterado", HttpStatus.BAD_REQUEST);
    }

    let novoStatus: StatusTrabalho = trabalhoStatusEditarDto.status as StatusTrabalho;
    if (trabalhoDB.status === StatusTrabalho.PENDENTE) {
      novoStatus = StatusTrabalho.MODELAGEM;
    }

    if (
      this.temComponenteIndefinidoNoTrabalho(trabalhoDB) &&
      this.statusExigeComponentesDefinidos(novoStatus)
    ) {
      throw new HttpException(
        'Existem componentes indefinidos neste trabalho. Defina os componentes no catálogo antes de avançar para AGUARDANDO_COMPONENTE, PACOTE, AGUARDANDO_COLETA, ENVIADO, ENVIADO_PROVA ou PAGAMENTO_RECEBIDO.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const trabalho: Partial<Trabalho> = {};

    trabalho.idTrabalho = idTrabalho;
    trabalho.status = novoStatus;

    const statusConcluidos = [StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA, StatusTrabalho.PAGAMENTO_RECEBIDO];
    const novoStatusConcluido = statusConcluidos.includes(novoStatus);
    const anteriorStatusConcluido = statusConcluidos.includes(trabalhoDB.status);

    if (novoStatusConcluido && !anteriorStatusConcluido) {
      const agora = new Date();
      if (trabalhoDB.dataConclusao == null) {
        await this.atualizaEstoque(idTrabalho);
        trabalho.dataConclusao = agora;
      }
      if (trabalhoDB.dataHoraEnvio == null) {
        trabalho.dataHoraEnvio = agora;
      }
    } else if (novoStatusConcluido && anteriorStatusConcluido) {
      // Já era concluído/enviado, mas garante que dataHoraEnvio esteja preenchida caso não estivesse
      if (trabalhoDB.dataHoraEnvio == null) {
        trabalho.dataHoraEnvio = trabalhoDB.dataConclusao || new Date();
      }
    } else if (!novoStatusConcluido) {
      trabalho.dataConclusao = null;
      trabalho.dataHoraEnvio = null;
    }

    const historicoNovo = await this.historicoStatusTrabalhoService.cadastrarHistoricoStatusTrabalho(currentUser, idTrabalho, trabalhoDB.status, trabalhoStatusEditarDto.status);
    trabalhoDB.historicoStatusTrabalho.push(historicoNovo);
    
    const trabalhoAtualizado = Object.assign(trabalhoDB, trabalho);
    const trabalhoSalvo = await this.trabalhoRepository.salvaTrabalho(trabalhoAtualizado)

    // Se o status mudou para CANCELADO, zera o valor da ordem de serviço (não recalcula)
    if (novoStatus === StatusTrabalho.CANCELADO) {
      try {
        await this.zerarOrdemServicoCancelado(idTrabalho);
      } catch (error) {
        this.logger.error(`Erro ao zerar OS do trabalho cancelado ${idTrabalho}: ${error.message}`, error.stack);
        // Não lança o erro para não interromper o fluxo principal
      }
    } else {
      // Se não for CANCELADO, atualiza a OS normalmente
      await this.atualizaOrdemServico(currentUser, idTrabalho);
    }
    
    // Se o status mudou para ENVIADO ou ENVIADO_PROVA, adiciona à próxima fatura
    if (novoStatus === StatusTrabalho.ENVIADO || novoStatus === StatusTrabalho.ENVIADO_PROVA) {
      try {
        // Aguarda um pouco para garantir que a OS foi atualizada
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.faturaService.adicionarTrabalhoAProximaFatura(idTrabalho);
      } catch (error) {
        this.logger.error(`Erro ao adicionar trabalho ${idTrabalho} à fatura: ${error.message}`, error.stack);
        // Não lança o erro para não interromper o fluxo principal
      }
    }

    return trabalhoSalvo;
  }

  async enviarParaProducao(idTrabalho: number) {
    const trabalhoDB = await this.buscarTrabalhoPorId(idTrabalho);

    if (!trabalhoDB) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }

    const trabalho: Partial<Trabalho> = {};

    trabalho.idTrabalho = idTrabalho;
    trabalho.status = StatusTrabalho.MODELAGEM;

    if (!trabalhoDB.ordem && trabalhoDB.status != StatusTrabalho.MODELAGEM && trabalho.status === StatusTrabalho.MODELAGEM) {
      let busca = await this.trabalhoRepository.buscaUltimoId();
      busca = busca && busca[0];

      if (isNaN(busca.ordem)) {
        busca.idTrabalho = 0;  
      }

      trabalho.ordem = parseInt(busca.ordem) + 1;
    }

    const trabalhoAtualizado = Object.assign(trabalhoDB, trabalho);

    return this.trabalhoRepository.salvaTrabalho(trabalhoAtualizado);
  }

  async buscarTrabalhoPorId(idTrabalho: number) {
    const trabalho = await this.trabalhoRepository.buscarProdutoPorId(idTrabalho);
    if (!trabalho) return trabalho;

    const trabalhoMotivos = await this.trabalhoMotivoRepository.find({ where: { idTrabalho } });
    const motivosRetrabalhoIds = trabalhoMotivos
      .filter((tm) => tm.motivo?.tipo === MotivoTipo.RETRABALHO)
      .map((tm) => tm.idMotivo);
    const motivosBonificacaoIds = trabalhoMotivos
      .filter((tm) => tm.motivo?.tipo === MotivoTipo.BONIFICACAO)
      .map((tm) => tm.idMotivo);

    return Object.assign(trabalho, {
      motivosRetrabalhoIds,
      motivosBonificacaoIds,
    });
  }

  private async validarESincronizarMotivosDoTrabalho(
    idTrabalho: number,
    retrabalhoAtivo: boolean,
    bonificacaoAtiva: boolean,
    motivosRetrabalhoIds?: number[],
    motivosBonificacaoIds?: number[],
  ) {
    const retrabalhoIds = retrabalhoAtivo ? (motivosRetrabalhoIds ?? []) : [];
    const bonificacaoIds = bonificacaoAtiva ? (motivosBonificacaoIds ?? []) : [];

    if (retrabalhoAtivo && retrabalhoIds.length < 1) {
      throw new HttpException('Selecione pelo menos 1 motivo de retrabalho.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (bonificacaoAtiva && bonificacaoIds.length < 1) {
      throw new HttpException('Selecione pelo menos 1 motivo de bonificação.', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const allIds = Array.from(new Set([...(retrabalhoIds ?? []), ...(bonificacaoIds ?? [])]));

    // Sempre sincroniza: se nenhum selecionado, limpa vínculos
    await this.trabalhoMotivoRepository.delete({ idTrabalho } as any);
    if (allIds.length === 0) return;

    const motivos = await this.motivoRepository.find({
      where: { idMotivo: In(allIds), ativo: 1 } as any,
    });

    if (motivos.length !== allIds.length) {
      throw new HttpException('Um ou mais motivos selecionados são inválidos/inativos.', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const mapa = new Map(motivos.map((m) => [m.idMotivo, m]));
    const tipoErradoRetrabalho = retrabalhoIds.find((id) => mapa.get(id)?.tipo !== MotivoTipo.RETRABALHO);
    if (tipoErradoRetrabalho) {
      throw new HttpException('Há motivo selecionado com tipo diferente de RETRABALHO.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const tipoErradoBonificacao = bonificacaoIds.find((id) => mapa.get(id)?.tipo !== MotivoTipo.BONIFICACAO);
    if (tipoErradoBonificacao) {
      throw new HttpException('Há motivo selecionado com tipo diferente de BONIFICACAO.', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    await this.trabalhoMotivoRepository.insert(
      allIds.map((idMotivo) => ({
        idTrabalho,
        idMotivo,
      })),
    );
  }

  async buscarTrabalhos(statusTrabalho: StatusTrabalho[], idEmpresa?: number, incluirOcultos = false) {
    if (idEmpresa) {
      return this.trabalhoRepository.buscarTrabalhosDaEmpresa(idEmpresa, statusTrabalho, incluirOcultos);
    }

    return this.trabalhoRepository.buscarTrabalhos(statusTrabalho, incluirOcultos);
  }

  async pesquisarTrabalhos(termo: string, idEmpresa?: number) {
    return this.trabalhoRepository.pesquisarTrabalhos(termo, idEmpresa);
  }

  async buscarTrabalhosPendentes(idEmpresa?:number) {
    if (idEmpresa) {
      return this.trabalhoRepository.buscarTrabalhosDaEmpresa(idEmpresa, [ StatusTrabalho.PENDENTE]);
    }

    return this.trabalhoRepository.buscarTrabalhos([StatusTrabalho.PENDENTE]);
  }

  async buscarTrabalhosConcluidos(idEmpresa: number, dataInicio: string, dataFim: string, incluirOcultos = false) {
    return await this.trabalhoRepository.buscarTrabalhosConcluidos([StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA, StatusTrabalho.PAGAMENTO_RECEBIDO], idEmpresa, dataInicio, dataFim, incluirOcultos);
  }

  async alternarOcultarConcluido(idTrabalho: number, ocultar?: boolean) {
    const trabalhoDB = await this.trabalhoRepository.buscarProdutoPorId(idTrabalho);
    if (!trabalhoDB) {
      throw new HttpException("Trabalho não encontrado", HttpStatus.NOT_FOUND);
    }
    const novoValor = ocultar !== undefined ? !!ocultar : !trabalhoDB.ocultoConcluido;
    await this.trabalhoRepository.atualizaTrabalho(idTrabalho, { ocultoConcluido: novoValor } as any);
    return { idTrabalho, ocultoConcluido: novoValor };
  }

  async buscarRelatorio(idEmpresa:number, statusTrabalho: StatusTrabalho[], dataInicio: string, dataFim: string) {
    if (statusTrabalho.length == 0) {
      statusTrabalho = [StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA ];
    }
    const trabalhos = await this.trabalhoRepository.buscarRelatorio(idEmpresa, statusTrabalho, dataInicio, dataFim);

    const faturados = [];
    const retrabalhos = [];
    const bonificados = [];

    for await (const trabalho of trabalhos) {
      const ordemServico = await this.ordemServicoService.buscarPorIdTrabalho(trabalho.idTrabalho);
      trabalho.ordemServico = ordemServico;

      const isRetrabalho = !!trabalho.retrabalho;
      const isBonificacao = !!trabalho.bonificacao;
      const temMotivos = trabalho.trabalhoMotivos && trabalho.trabalhoMotivos.length > 0;
      const isRetrabalhoEfetivo = isRetrabalho || (temMotivos && !isBonificacao);

      if (isBonificacao) {
        bonificados.push(trabalho);
      } else if (isRetrabalhoEfetivo) {
        retrabalhos.push(trabalho);
      } else {
        faturados.push(trabalho);
      }
    }

    const baixas = await this.devolucaoComponenteService.buscarHistoricoBaixas(idEmpresa, dataInicio, dataFim);

    return {
      faturados,
      retrabalhos,
      bonificados,
      baixas
    };
  }

  async ordenatrabalhos(idEmpresa :number, idtrabalhos: number[]) {
    const trabalhosPendente = await this.buscarTrabalhosPendentesPorIdEmpresa(idEmpresa);
    const ordemTrabalhoPendente = trabalhosPendente.map(trabalho => trabalho.ordem).sort();

    const trabalhosOrdenados = idtrabalhos.reduce((previosValue: { idTrabalho: number, ordem: number }[], currentValue: number, currentIndex: number) => {

      const ordem = {
        idTrabalho: currentValue,
        ordem: ordemTrabalhoPendente[currentIndex]
      }
      
      previosValue.push(ordem);

      return previosValue;
    }, []);


    for await (let trabalho of trabalhosOrdenados) {
      await this.atualizaOrdem(trabalho.idTrabalho, trabalho.ordem);
    }

    return await this.buscarTrabalhosPendentes(idEmpresa);
  }

  private async buscarTrabalhosPendentesPorIdEmpresa(idEmpresa: number) {
    if(idEmpresa) {
      return await this.trabalhoRepository.buscarTrabalhosPendentesPorIdEmpresa(idEmpresa);
    }
    return await this.trabalhoRepository.buscarTrabalhosPendentes();
  }

  private async atualizaOrdem(idTrabalho: number, ordem: number) {
    return this.trabalhoRepository.atualizaOrdem(idTrabalho, ordem);
  }

  @OnEvent('preco.changed')
  public async recalcularValorTrabalhosEnviados(currentUser: any) {
    const trabalhosEnviados = await this.trabalhoRepository.buscarTrabalhos([StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA]);
    for await (const trabalho of trabalhosEnviados) {
      await this.atualizaOrdemServico(currentUser, trabalho.idTrabalho);
    }
  }

  /**
   * Método público para atualizar preços da ordem de serviço sem emitir eventos.
   * Usado durante o recálculo de faturas para evitar loops de eventos.
   */
  async atualizarPrecosOrdemServico(currentUser: any, idTrabalho: number, emitirEvento: boolean = false): Promise<void> {
    // Componente o preço é fixo X a quantidade de componentes
    // valor do serviço dentro da tabela de preço X quantidade de elementos
    const osBase = await this.ordemServicoService.buscarPorIdTrabalho(idTrabalho);
    
    // Busca o trabalho com todas as relações necessárias para evitar queries N+1
    const trabalho = await this.trabalhoRepository.buscarProdutoPorIdComRelacoes(idTrabalho);
    
    if (!trabalho) {
      throw new NotFoundException(`Trabalho com ID ${idTrabalho} não encontrado.`);
    }
    
    const cadastroComplementar = await this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(trabalho.idEmpresa);

    const dataReferencia = trabalho.dataInclusao || new Date();

    // Sempre buscar a tabela vigente pela associação empresa-tabela (referência para o cálculo)
    let tabelaVigenteAssociacao: TabelaPrecoProduto | null = await this.empresaTabelaPrecoService.buscarTabelaPrecoVigentePorEmpresa(
      trabalho.idEmpresa,
      dataReferencia
    );

    if (tabelaVigenteAssociacao) {
      this.logger.log(
        `[Trabalho ${idTrabalho}] Tabela vigente (associação empresa-tabela): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`
      );
    }

    // Fallback: se não encontrou associação específica, usar a tabela do cadastro complementar (compatibilidade)
    if (!tabelaVigenteAssociacao && cadastroComplementar?.idTabelaPrecoProduto) {
      this.logger.log(
        `[Trabalho ${idTrabalho}] Nenhuma associação específica encontrada, usando tabela do cadastro complementar como fallback (matriz: ${cadastroComplementar.idTabelaPrecoProduto})`
      );
      tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(
        cadastroComplementar.idTabelaPrecoProduto,
        dataReferencia
      );
      if (tabelaVigenteAssociacao) {
        this.logger.log(
          `[Trabalho ${idTrabalho}] Tabela encontrada via cadastro complementar (versão): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`
        );
      }
    }
    if (!tabelaVigenteAssociacao && cadastroComplementar?.idTabelaPrecoProduto) {
      tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
      if (tabelaVigenteAssociacao) {
        this.logger.log(
          `[Trabalho ${idTrabalho}] Tabela encontrada via cadastro complementar (matriz direta): ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}, Nome: "${tabelaVigenteAssociacao.nome}"`
        );
      }
    }

    // Conferência: se o trabalho já tem tabela, usar para cálculo só se for a mesma da associação; caso contrário usar a da associação
    let tabelaPrecoProduto: TabelaPrecoProduto | null = null;
    if (trabalho.idTabelaPrecoProduto) {
      const tabelaDoTrabalho = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(trabalho.idTabelaPrecoProduto);
      const mesmaTabela =
        tabelaVigenteAssociacao &&
        tabelaDoTrabalho &&
        tabelaDoTrabalho.idTabelaPrecoProduto === tabelaVigenteAssociacao.idTabelaPrecoProduto;
      if (mesmaTabela) {
        tabelaPrecoProduto = tabelaDoTrabalho;
        this.logger.log(
          `[Trabalho ${idTrabalho}] Conferência OK: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) é a mesma da associação empresa-tabela; usando para cálculo.`
        );
      } else if (tabelaVigenteAssociacao) {
        tabelaPrecoProduto = tabelaVigenteAssociacao;
        this.logger.log(
          `[Trabalho ${idTrabalho}] Conferência: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) difere da vigente (ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}); usando tabela da associação empresa-tabela para cálculo.`
        );
      } else {
        tabelaPrecoProduto = tabelaDoTrabalho ?? null;
        if (tabelaPrecoProduto) {
          this.logger.log(
            `[Trabalho ${idTrabalho}] Sem associação vigente; usando tabela do trabalho: ID ${trabalho.idTabelaPrecoProduto}`
          );
        }
      }
    } else {
      tabelaPrecoProduto = tabelaVigenteAssociacao;
    }

    if (!tabelaPrecoProduto) {
      this.logger.error(`Tabela de preço não encontrada para o trabalho ${idTrabalho}`);
      throw new NotFoundException(`Tabela de preço não encontrada para o trabalho ${idTrabalho}`);
    }

    // Log informativo sobre qual tabela está sendo usada
    const mesmaQueTrabalho = trabalho.idTabelaPrecoProduto && tabelaPrecoProduto.idTabelaPrecoProduto === trabalho.idTabelaPrecoProduto;
    const tipoTabela = mesmaQueTrabalho ? 'histórica (do trabalho - conferência OK)' : 'vigente (associação empresa-tabela)';
    const versaoInfo = tabelaPrecoProduto.numeroVersao ? `, Versão: ${tabelaPrecoProduto.numeroVersao}` : '';
    const origemInfo = tabelaPrecoProduto.idTabelaPrecoProdutoOrigem ? ` (versão da matriz ${tabelaPrecoProduto.idTabelaPrecoProdutoOrigem})` : ' (matriz)';
    this.logger.log(
      `[Cálculo Preço - Trabalho ${idTrabalho}] ` +
      `Tabela utilizada: ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, ` +
      `Nome: "${tabelaPrecoProduto.nome}"${versaoInfo}${origemInfo}, ` +
      `Tipo: ${tipoTabela}, ` +
      `Empresa: ${trabalho.idEmpresa}, ` +
      `Data referência: ${(trabalho.dataInclusao || new Date()).toISOString()}`
    );

    let osData: OrdemServico;

    if (osBase) {
      osData = osBase;
    } else {
      osData = new OrdemServico();
    }

    osData.ativo = true;
    osData.idTrabalho = trabalho.idTrabalho;
    osData.idEmpresa = trabalho.idEmpresa;
    osData.idUsuarioCadastro = currentUser.user.idUsuario;

    const statusConcluidos = [StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA, StatusTrabalho.PAGAMENTO_RECEBIDO];
    if (statusConcluidos.includes(trabalho.status)) {
      osData.status = StatusOrdemServico.RECEBER;
      osData.concluido = true;
      if (!osData.dataConcluido) {
        osData.dataConcluido = trabalho.dataConclusao || trabalho.dataHoraEnvio || new Date();
      }
    } else {
      osData.status = StatusOrdemServico.PENDENTE;
      osData.concluido = false;
      osData.dataConcluido = null;
    }

    // Calcula a nova lista de itens da OS com base no estado atual do trabalho.
    const itens = this.calculaItensOrdemServico(currentUser.user.idUsuario, trabalho, cadastroComplementar, tabelaPrecoProduto, osData.itens, trabalho.status);
    
    // Substitui a lista de itens antiga pela nova.
    // Graças à opção { orphanedRowAction: 'delete' } na entidade OrdemServico,
    // o TypeORM irá automaticamente deletar do banco os itens que foram removidos desta lista.
    osData.itens = itens;

    // Recalcula o valor total da Ordem de Serviço com base na nova lista de itens.
    const valorTotal = osData.itens
      .filter((item) => item.status !== StatusOrdemServicoItem.DEVOLVIDO)
      .reduce((total, item) => total + item.valorTotal, 0);
    
    osData.valorTotal = valorTotal;

    // Salva a Ordem de Serviço. O `cascade: true` e `orphanedRowAction` cuidarão de
    // inserir, atualizar e remover os itens conforme necessário.
    const osSalva = await this.ordemServicoService.cadastrar(currentUser, [osData]);
    const osSalvaCompleta = osSalva[0];
    
    // Emite evento apenas se solicitado (evita loops durante recálculo de fatura)
    // Busca o idFatura diretamente da OS salva para evitar problemas de relação não carregada
    if (emitirEvento && osSalvaCompleta?.idFatura) {
      this.eventEmitter.emit('fatura.recalcular', { idFatura: osSalvaCompleta.idFatura });
    }
  }

  /**
   * Atualiza preços de todas as OS de uma fatura em lote: 1 carga de trabalhos, 1 carga de OS, 1 save.
   * Reduz drasticamente queries e uso de memória em relação ao loop de atualizarPrecosOrdemServico.
   */
  async atualizarPrecosOrdemServicoEmLote(currentUser: any, idFatura: number, idsTrabalhos: number[]): Promise<void> {
    if (idsTrabalhos.length === 0) return;

    const [trabalhos, ordensServico] = await Promise.all([
      this.trabalhoRepository.buscarProdutosPorIdsComRelacoes(idsTrabalhos),
      this.ordemServicoService.buscarPorIdTrabalhos(idsTrabalhos),
    ]);

    const trabalhoPorId = new Map<number, Trabalho>();
    for (const t of trabalhos) trabalhoPorId.set(t.idTrabalho!, t);

    const osPorTrabalho = new Map<number, OrdemServico>();
    for (const os of ordensServico) osPorTrabalho.set(os.idTrabalho, os);

    // Cache de tabelas por empresa para otimizar buscas repetidas
    const tabelasPorEmpresa = new Map<number, Map<string, TabelaPrecoProduto | null>>();
    const cadastrosComplementaresPorEmpresa = new Map<number, CadastroComplementarEmpresa>();

    // Buscar cadastros complementares em lote (agrupar por empresa)
    const empresasUnicas = [...new Set(trabalhos.map(t => t.idEmpresa))];
    const cadastrosPromises = empresasUnicas.map(idEmpresa =>
      this.cadastroComplementarEmpresaService.buscarCadastroComplementarEmpresa(idEmpresa)
        .then(cadastro => ({ idEmpresa, cadastro }))
    );
    const cadastrosResultados = await Promise.all(cadastrosPromises);
    cadastrosResultados.forEach(({ idEmpresa, cadastro }) => {
      if (cadastro) cadastrosComplementaresPorEmpresa.set(idEmpresa, cadastro);
    });

    const ordensToSave: OrdemServico[] = [];
    for (const trabalho of trabalhos) {
      const idTrabalho = trabalho.idTrabalho!;
      const osBase = osPorTrabalho.get(idTrabalho) ?? null;
      const cadastroComplementar = cadastrosComplementaresPorEmpresa.get(trabalho.idEmpresa);

      const dataReferencia = trabalho.dataInclusao || new Date();
      const dataKey = dataReferencia.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!tabelasPorEmpresa.has(trabalho.idEmpresa)) {
        tabelasPorEmpresa.set(trabalho.idEmpresa, new Map());
      }
      const cacheEmpresa = tabelasPorEmpresa.get(trabalho.idEmpresa)!;

      // Sempre obter a tabela vigente pela associação empresa-tabela (com cache por empresa+data)
      let tabelaVigenteAssociacao: TabelaPrecoProduto | null;
      if (cacheEmpresa.has(dataKey)) {
        tabelaVigenteAssociacao = cacheEmpresa.get(dataKey)!;
      } else {
        tabelaVigenteAssociacao = await this.empresaTabelaPrecoService.buscarTabelaPrecoVigentePorEmpresa(
          trabalho.idEmpresa,
          dataReferencia
        );
        if (!tabelaVigenteAssociacao && cadastroComplementar?.idTabelaPrecoProduto) {
          tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscarTabelaPrecoVigentePorMatriz(
            cadastroComplementar.idTabelaPrecoProduto,
            dataReferencia
          );
        }
        if (!tabelaVigenteAssociacao && cadastroComplementar?.idTabelaPrecoProduto) {
          tabelaVigenteAssociacao = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(cadastroComplementar.idTabelaPrecoProduto);
        }
        cacheEmpresa.set(dataKey, tabelaVigenteAssociacao);
      }

      // Conferência: se o trabalho já tem tabela, usar para cálculo só se for a mesma da associação; caso contrário usar a da associação
      let tabelaPrecoProduto: TabelaPrecoProduto | null = null;
      if (trabalho.idTabelaPrecoProduto) {
        const tabelaDoTrabalho = await this.tabelaPrecoProdutoService.buscaTabelaPrecoProdutosPorId(trabalho.idTabelaPrecoProduto);
        const mesmaTabela =
          tabelaVigenteAssociacao &&
          tabelaDoTrabalho &&
          tabelaDoTrabalho.idTabelaPrecoProduto === tabelaVigenteAssociacao.idTabelaPrecoProduto;
        if (mesmaTabela) {
          tabelaPrecoProduto = tabelaDoTrabalho;
          this.logger.log(
            `[Fatura ${idFatura} - Trabalho ${idTrabalho}] Conferência OK: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) é a mesma da associação; usando para cálculo.`
          );
        } else if (tabelaVigenteAssociacao) {
          tabelaPrecoProduto = tabelaVigenteAssociacao;
          this.logger.log(
            `[Fatura ${idFatura} - Trabalho ${idTrabalho}] Conferência: tabela do trabalho (ID ${trabalho.idTabelaPrecoProduto}) difere da vigente (ID ${tabelaVigenteAssociacao.idTabelaPrecoProduto}); usando tabela da associação empresa-tabela para cálculo.`
          );
        } else {
          tabelaPrecoProduto = tabelaDoTrabalho ?? null;
          if (tabelaPrecoProduto) {
            this.logger.log(
              `[Fatura ${idFatura} - Trabalho ${idTrabalho}] Sem associação vigente; usando tabela do trabalho: ID ${trabalho.idTabelaPrecoProduto}`
            );
          }
        }
      } else {
        tabelaPrecoProduto = tabelaVigenteAssociacao;
        if (tabelaPrecoProduto) {
          this.logger.log(
            `[Fatura ${idFatura} - Trabalho ${idTrabalho}] Tabela vigente (associação empresa-tabela): ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, Nome: "${tabelaPrecoProduto.nome}"`
          );
        }
      }

      if (!tabelaPrecoProduto) {
        this.logger.warn(`Tabela de preço não encontrada para trabalho ${idTrabalho} na fatura ${idFatura}; ignorando.`);
        continue;
      }

      // Log informativo sobre qual tabela está sendo usada para cada trabalho na fatura
      const mesmaQueTrabalho = trabalho.idTabelaPrecoProduto && tabelaPrecoProduto.idTabelaPrecoProduto === trabalho.idTabelaPrecoProduto;
      const tipoTabela = mesmaQueTrabalho ? 'histórica (do trabalho - conferência OK)' : 'vigente (associação empresa-tabela)';
      const versaoInfo = tabelaPrecoProduto.numeroVersao ? `, Versão: ${tabelaPrecoProduto.numeroVersao}` : '';
      const origemInfo = tabelaPrecoProduto.idTabelaPrecoProdutoOrigem ? ` (versão da matriz ${tabelaPrecoProduto.idTabelaPrecoProdutoOrigem})` : ' (matriz)';
      this.logger.log(
        `[Cálculo Preço - Fatura ${idFatura} - Trabalho ${idTrabalho}] ` +
        `Tabela utilizada: ID ${tabelaPrecoProduto.idTabelaPrecoProduto}, ` +
        `Nome: "${tabelaPrecoProduto.nome}"${versaoInfo}${origemInfo}, ` +
        `Tipo: ${tipoTabela}, ` +
        `Empresa: ${trabalho.idEmpresa}, ` +
        `Data referência: ${(trabalho.dataInclusao || new Date()).toISOString()}`
      );

      let osData: OrdemServico;
      if (osBase) {
        osData = osBase;
      } else {
        osData = new OrdemServico();
      }

      osData.ativo = true;
      osData.idTrabalho = trabalho.idTrabalho;
      osData.idEmpresa = trabalho.idEmpresa;
      osData.idUsuarioCadastro = currentUser.user.idUsuario;
      const statusConcluidos = [StatusTrabalho.ENVIADO, StatusTrabalho.ENVIADO_PROVA, StatusTrabalho.PAGAMENTO_RECEBIDO];
      if (statusConcluidos.includes(trabalho.status)) {
        osData.status = StatusOrdemServico.RECEBER;
        osData.concluido = true;
        if (!osData.dataConcluido) {
          osData.dataConcluido = trabalho.dataConclusao || trabalho.dataHoraEnvio || new Date();
        }
      } else {
        osData.status = StatusOrdemServico.PENDENTE;
        osData.concluido = false;
        osData.dataConcluido = null;
      }

      const itens = this.calculaItensOrdemServico(currentUser.user.idUsuario, trabalho, cadastroComplementar, tabelaPrecoProduto, osData.itens ?? [], trabalho.status);
      osData.itens = itens;
      osData.valorTotal = itens
        .filter((item) => item.status !== StatusOrdemServicoItem.DEVOLVIDO)
        .reduce((total, item) => total + item.valorTotal, 0);
      ordensToSave.push(osData);
    }

    if (ordensToSave.length > 0) {
      await this.ordemServicoService.cadastrar(currentUser, ordensToSave);
    }
  }

  private async atualizaOrdemServico(currentUser: any, idTrabalho: number) {
    // Chama o método público com emitirEvento = true para manter compatibilidade
    await this.atualizarPrecosOrdemServico(currentUser, idTrabalho, true);
  }

  private calculaItensOrdemServico(idUsuarioCadastro: number, trabalho: Trabalho, cadastroComplementar: CadastroComplementarEmpresa, tabelaPrecoProduto: TabelaPrecoProduto, itensBase: OrdemServicoItem[], statusTrabalho: StatusTrabalho) {
    let itens: OrdemServicoItem[] = [];

    const componentes = trabalho.componentes;
    const itensComponentes = this.calculaComponentes(idUsuarioCadastro, trabalho.retrabalho, !!cadastroComplementar?.utilizaInterfaces, componentes, itensBase);
    itens = itens.concat(itensComponentes);

    const elementos = trabalho.servicos.reduce((previous, current) => {
      current.elementos;
      return previous.concat(current.elementos);
    }, [] as ElementosTrabalho[]);

    const semCobrancaServico = !!trabalho.retrabalho || !!trabalho.bonificacao;
    const itensServicos = this.calculaServicos(idUsuarioCadastro, semCobrancaServico, trabalho.servicos, tabelaPrecoProduto, itensBase, statusTrabalho);
    itens = itens.concat(itensServicos);

    itens = itens.filter(item => item !== null);

    const itensDevolvidos = (itensBase ?? []).filter(
      (item) => item.status === StatusOrdemServicoItem.DEVOLVIDO,
    );
    for (const devolvido of itensDevolvidos) {
      const jaIncluso = itens.some(
        (item) => item.idOrdemServicoItem === devolvido.idOrdemServicoItem,
      );
      if (!jaIncluso) {
        itens.push(devolvido);
      }
    }

    return itens;
  }

  private calculaComponentes(idUsuarioCadastro: number, retrabalho: boolean, utilizaInterfaces: boolean, componentesTrabalho: ComponentesTrabalho[], itensBase: OrdemServicoItem[]) {
    return (componentesTrabalho ?? []).map(componenteTrabalho => {
      let item: OrdemServicoItem | undefined;
      if (itensBase?.length) {
        const itemFiltrado = itensBase.filter(
          (i) => componenteTrabalho.componente.idComponente === i.idReferencia && i.tipoCobranca === TipoCobranca.COMPONENTE
        );
        item = itemFiltrado.length ? itemFiltrado[0] : undefined;
      }

      if (item?.status === StatusOrdemServicoItem.DEVOLVIDO) return null;

      const componenteJaDevolvido = (itensBase ?? []).some(
        (i) =>
          i.tipoCobranca === TipoCobranca.COMPONENTE &&
          i.idReferencia === componenteTrabalho.componente.idComponente &&
          i.status === StatusOrdemServicoItem.DEVOLVIDO,
      );
      if (componenteJaDevolvido) return null;

      const nomesIgnorados = ['SEM COMPONENTE', 'INDEFINIDO'];
      if (nomesIgnorados.includes(componenteTrabalho.componente.nome)) return null;

      const valorTotal = componenteTrabalho.componente.preco * componenteTrabalho.qtdItems;
      return this.criarItemOrdemServico(TipoCobranca.COMPONENTE, item, idUsuarioCadastro, componenteTrabalho.componente.nome, componenteTrabalho.componente.preco, componenteTrabalho.qtdItems, componenteTrabalho.componente.idComponente, null, null);
    });
  }

  private calculaServicos(idUsuarioCadastro: number, retrabalho: boolean, servicos: ServicoTrabalho[], tabelaPrecoProduto: TabelaPrecoProduto, itensBase: OrdemServicoItem[], statusTrabalho: StatusTrabalho) {
    if (!servicos?.length) return [];

    return servicos.map(servico => {
      const { idProduto, elementos } = servico;
      const precoProdutoArray = tabelaPrecoProduto.precoProduto?.filter(p => p.idProduto === idProduto) ?? [];

      if (!precoProdutoArray.length) {
        this.logger.warn(`Preço para produto ID ${idProduto} não encontrado na tabela ${tabelaPrecoProduto.idTabelaPrecoProduto}.`);
        return null;
      }
      const precoProduto = precoProdutoArray[0];

      let item: OrdemServicoItem | undefined;
      if (itensBase?.length) {
        const itemFiltrado = itensBase.filter(i => i.idReferencia === idProduto && i.tipoCobranca === TipoCobranca.SERVICO);
        item = itemFiltrado.length ? itemFiltrado[0] : undefined;
      }

      const quantidade = elementos?.length ?? 0;
      const valorUnitario = (retrabalho || statusTrabalho === StatusTrabalho.ENVIADO_PROVA) ? 0 : Number(precoProduto.preco);
      const valorTotal = valorUnitario * quantidade;

      return this.criarItemOrdemServico(TipoCobranca.SERVICO, item, idUsuarioCadastro, precoProduto.produto?.nome ?? '', valorUnitario, quantidade, idProduto, null, null);
    }).filter(Boolean) as OrdemServicoItem[];
  }

  private criarItemOrdemServico(tipoCobranca: TipoCobranca, item: OrdemServicoItem, idUsuarioCadastro: number, descricao: string, valor: number, quantidade: number, idReferencia: number, idProfissional: number, idPaciente: number): OrdemServicoItem {
    if (!item) {
      item = new OrdemServicoItem();
    }

    // Preservar quantidadeDevolvida e status se o item já existe
    const quantidadeDevolvidaExistente = item.quantidadeDevolvida || 0;
    const statusExistente = item.status;

    if (statusExistente === StatusOrdemServicoItem.DEVOLVIDO) {
      item.valor = 0;
      item.valorTotal = 0;
      item.quantidadeDevolvida = quantidadeDevolvidaExistente;
      item.status = statusExistente;
      return item;
    }

    item.descricao = descricao;
    item.valor = valor;
    item.quantidade = quantidade;
    // Recalcular valorTotal considerando a quantidade devolvida
    item.valorTotal = valor * (quantidade - quantidadeDevolvidaExistente);
    item.idUsuarioCadastro = idUsuarioCadastro;
    item.idReferencia = idReferencia;
    item.tipoCobranca = tipoCobranca;
    item.idProfissional = idProfissional;
    item.idPaciente = idPaciente;
    
    // Preservar quantidadeDevolvida e status se já existiam
    if (quantidadeDevolvidaExistente > 0) {
      item.quantidadeDevolvida = quantidadeDevolvidaExistente;
    }
    if (statusExistente) {
      item.status = statusExistente;
    }

    return item;
  }

  /**
   * Zera o valor dos serviços da ordem de serviço quando o trabalho é cancelado.
   * Mantém o valor dos componentes (materiais já utilizados devem ser cobrados).
   * Também recalcula a fatura se a OS estiver em uma fatura.
   */
  private async zerarOrdemServicoCancelado(idTrabalho: number): Promise<void> {
    // Busca a OS com os itens carregados explicitamente
    const ordemServico = await this.ordemServicoService.buscarPorIdTrabalho(idTrabalho);
    
    if (!ordemServico) {
      this.logger.log(`Ordem de Serviço não encontrada para o trabalho ${idTrabalho}.`);
      return;
    }

    // Busca os itens da OS explicitamente para garantir que estejam carregados
    const itens = await this.osItemRepository.find({
      where: { idOrdemServico: ordemServico.idOrdemServico }
    });

    let itensZerados = 0;

    // Zera TODOS os itens (serviços e componentes) quando o trabalho é cancelado
    if (itens && itens.length > 0) {
      for (const item of itens) {
        // Zera todos os itens, independente do tipo
        item.valor = 0;
        item.valorTotal = 0;
        await this.osItemRepository.save(item);
        itensZerados++;
      }
      this.logger.log(`Zerados ${itensZerados} itens (serviços e componentes) da OS ${ordemServico.idOrdemServico}.`);
    }

    // Atualiza o valor total da OS para zero
    ordemServico.valorTotal = 0;

    // Salva a OS atualizada
    await this.ordemServicoService.cadastrar(
      { user: { idUsuario: ordemServico.idUsuarioCadastro } }, 
      [ordemServico]
    );

    this.logger.log(`OS ${ordemServico.idOrdemServico} zerada. Valor total: 0`);

    // Se a OS estiver em uma fatura, recalcula a fatura
    if (ordemServico.idFatura) {
      this.eventEmitter.emit('fatura.recalcular', { idFatura: ordemServico.idFatura });
      this.logger.log(`Fatura ${ordemServico.idFatura} será recalculada.`);
    }
  }

  /**
   * Payload de atualização não pode incluir componente “indefinido” quando o trabalho já está
   * em status que exige itens do catálogo (mesma regra de mudança de status).
   */
  private validarComponentesDtoIndefinidosProibidosNoStatus(
    status: StatusTrabalho,
    componentesDto: ComponenteDto[] | undefined,
  ): void {
    if (!componentesDto?.length) {
      return;
    }
    if (!this.statusExigeComponentesDefinidos(status)) {
      return;
    }
    if (componentesDto.some((c) => this.componenteDtoEhIndefinido(c))) {
      throw new HttpException(
        'Não é possível adicionar componente indefinido com o trabalho neste status. Selecione um componente válido do catálogo.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /** id ausente/inválido ou nome vazio / “Indefinido” (alinhado à persistência e à listagem). */
  private componenteDtoEhIndefinido(c: Pick<ComponenteDto, 'idComponente' | 'nome'>): boolean {
    const idNum = c.idComponente != null ? Number(c.idComponente) : NaN;
    const idOk = Number.isFinite(idNum) && idNum > 0;
    const nome = String(c.nome ?? '').trim();
    const nomeIndefinido = !nome || nome.toLowerCase() === 'indefinido';
    return !idOk || nomeIndefinido;
  }

  /** Status em que todos os componentes do trabalho precisam estar definidos no catálogo. */
  private statusExigeComponentesDefinidos(status: StatusTrabalho): boolean {
    return [
      StatusTrabalho.AGUARDANDO_COMPONENTE,
      StatusTrabalho.PACOTE,
      StatusTrabalho.AGUARDANDO_COLETA,
      StatusTrabalho.ENVIADO,
      StatusTrabalho.ENVIADO_PROVA,
      StatusTrabalho.PAGAMENTO_RECEBIDO,
    ].includes(status);
  }

  /**
   * Valida linhas persistidas em TbComponentesTrabalho + TbComponente (catálogo carregado na mesma leitura).
   * Indefinido: FK idComponente inválida, catálogo ausente na join, ou nome vazio / "Indefinido".
   */
  private temComponenteIndefinidoNoTrabalho(trabalho: Trabalho): boolean {
    const lista =
      trabalho.componentes?.filter((ct) => ct.dataExclusao == null) ?? [];
    if (!lista.length) {
      return false;
    }
    for (const ct of lista) {
      const idNum = Number(ct.idComponente);
      const idFkOk = Number.isFinite(idNum) && idNum > 0;

      const comp = ct.componente;
      if (!idFkOk || comp == null) {
        return true;
      }

      const nome = String(comp.nome ?? '').trim();
      const nomeIndefinido = !nome || nome.toLowerCase() === 'indefinido';
      if (nomeIndefinido) {
        return true;
      }
    }
    return false;
  }

  async buscarDashboardStatus(dataInicio: string, dataFim: string) {
    const trabalhos = await this.trabalhoRepository.buscarTrabalhosDashboard(dataInicio, dataFim);
    
    const totalTrabalhos = trabalhos.length;
    let totalRetrabalhos = 0;
    let totalBonificacoes = 0;
    
    const statusGeral: { [key: string]: number } = {};
    const trabalhosPorData: { [data: string]: { total: number, retrabalho: number, bonificacao: number } } = {};
    const motivosGeraisRetrabalho: { [motivo: string]: number } = {};
    const motivosGeraisBonificacao: { [motivo: string]: number } = {};
    
    // Map of clinicas: idEmpresa -> data
    const clinicasMap = new Map<number, any>();

    for (const t of trabalhos) {
      // Status aggregation
      statusGeral[t.status] = (statusGeral[t.status] || 0) + 1;
      
      // Date aggregation
      const dataIncStr = t.dataInclusao ? new Date(t.dataInclusao).toISOString().split('T')[0] : 'N/A';
      if (!trabalhosPorData[dataIncStr]) trabalhosPorData[dataIncStr] = { total: 0, retrabalho: 0, bonificacao: 0 };
      trabalhosPorData[dataIncStr].total++;

      // Identifica flags
      const isRetrabalho = !!t.retrabalho;
      const isBonificacao = !!t.bonificacao;
      // Motivos sem flag explícita contam como retrabalho (comportamento legado)
      const temMotivos = t.trabalhoMotivos && t.trabalhoMotivos.length > 0;
      const isRetrabalhoEfetivo = isRetrabalho || (temMotivos && !isBonificacao);

      if (isRetrabalhoEfetivo) {
        totalRetrabalhos++;
        trabalhosPorData[dataIncStr].retrabalho++;
      }
      if (isBonificacao) {
        totalBonificacoes++;
        trabalhosPorData[dataIncStr].bonificacao++;
      }

      // Clinic/Empresa grouping
      if (!clinicasMap.has(t.idEmpresa)) {
        clinicasMap.set(t.idEmpresa, {
          idEmpresa: t.idEmpresa,
          nomeEmpresa: t.nomeEmpresa || (t.empresa ? t.empresa.nome : 'Sem Empresa'),
          totalTrabalhos: 0,
          totalRetrabalhos: 0,
          totalBonificacoes: 0,
          motivosRetrabalho: {},
          motivosBonificacao: {},
        });
      }
      
      const clinicaData = clinicasMap.get(t.idEmpresa);
      clinicaData.totalTrabalhos++;

      if (isRetrabalhoEfetivo) {
        clinicaData.totalRetrabalhos++;
        if (t.trabalhoMotivos) {
          for (const tm of t.trabalhoMotivos) {
            const motivoNome = tm.motivo ? tm.motivo.nome : 'Motivo Desconhecido';
            motivosGeraisRetrabalho[motivoNome] = (motivosGeraisRetrabalho[motivoNome] || 0) + 1;
            clinicaData.motivosRetrabalho[motivoNome] = (clinicaData.motivosRetrabalho[motivoNome] || 0) + 1;
          }
        }
      }

      if (isBonificacao) {
        clinicaData.totalBonificacoes++;
        if (t.trabalhoMotivos) {
          for (const tm of t.trabalhoMotivos) {
            const motivoNome = tm.motivo ? tm.motivo.nome : 'Motivo Desconhecido';
            motivosGeraisBonificacao[motivoNome] = (motivosGeraisBonificacao[motivoNome] || 0) + 1;
            clinicaData.motivosBonificacao[motivoNome] = (clinicaData.motivosBonificacao[motivoNome] || 0) + 1;
          }
        }
      }
    }

    const toMotivosArray = (obj: { [k: string]: number }) =>
      Object.entries(obj).map(([nome, count]) => ({ nome, count })).sort((a: any, b: any) => b.count - a.count);

    // Convert map to array
    const clinicas = Array.from(clinicasMap.values()).map(c => ({
      ...c,
      motivosRetrabalhoArray: toMotivosArray(c.motivosRetrabalho),
      motivosBonificacaoArray: toMotivosArray(c.motivosBonificacao),
      // Mantém compatibilidade: motivosArray = retrabalho (legado)
      motivosArray: toMotivosArray(c.motivosRetrabalho),
    })).sort((a, b) => b.totalRetrabalhos - a.totalRetrabalhos);

    return {
      totalTrabalhos,
      totalRetrabalhos,
      totalBonificacoes,
      statusGeral,
      trabalhosPorData,
      motivosGeraisRetrabalho: toMotivosArray(motivosGeraisRetrabalho),
      motivosGeraisBonificacao: toMotivosArray(motivosGeraisBonificacao),
      // Mantém compatibilidade (legado)
      motivosGerais: toMotivosArray(motivosGeraisRetrabalho),
      clinicas,
    };
  }
}
