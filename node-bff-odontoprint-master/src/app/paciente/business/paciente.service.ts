import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paciente } from '../domain/paciente.entity';
import { UpdatePacienteDto } from '../dto/update-paciente.dto';
import { CreatePacienteDto } from '../dto/create-paciente.dto';
import { TrabalhoService } from '@src/app/trabalho/business/trabalho.service';
import { StatusTrabalho } from '@src/app/trabalho/domain/trabalho.entity';
import { MotivoTipo } from '@src/app/motivo/dto/motivo.dto';
import { EmpresaService } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios';

@Injectable()
export class PacienteService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @Inject(forwardRef(() => TrabalhoService))
    private readonly trabalhoService: TrabalhoService,
    private readonly empresaService: EmpresaService,
  ) {}

  async create(createPacienteDto: CreatePacienteDto, idUsuarioCadastro: number): Promise<Paciente> {
    const { nome, idEmpresa, idProfissional } = createPacienteDto;

    const existingPaciente = await this.pacienteRepository.findOne({
      where: { nome: nome.toUpperCase().trim(), idEmpresa, idProfissional },
    });

    if (existingPaciente) {
      throw new ConflictException(`Paciente com o nome "${nome}" já existe para este dentista na empresa.`);
    }

    const paciente = this.pacienteRepository.create(<Paciente>{
      nome: nome.toUpperCase().trim(),
      idEmpresa,
      idProfissional,
      idUsuarioCadastro,
    });

    return this.pacienteRepository.save(paciente);
  }

  async findAll(idEmpresa: number, idProfissional: number): Promise<Paciente[]> {
    return this.pacienteRepository.find({
      where: { idEmpresa, idProfissional },
      order: { dataInclusao: 'DESC' },
    });
  }

  async findOne(idPaciente: number, idEmpresa?: number): Promise<Paciente> {
    const where: FindOptionsWhere<Paciente> = { idPaciente };
    if (idEmpresa) {
      where.idEmpresa = idEmpresa;
    }

    const paciente = await this.pacienteRepository
      .createQueryBuilder('paciente')
      .where(where)
      // Ordena os trabalhos pela data de conclusão, do mais recente para o mais antigo
      .orderBy('trabalho.dataConclusao', 'DESC')
      // Adiciona as relações
      // leftJoinAndSelect para carregar as relações
      // 'paciente.trabalhos' é a propriedade da entidade Paciente que se relaciona com Trabalho
      // 'trabalho' é o alias que estamos dando para a tabela de trabalhos no JOIN
      .leftJoinAndSelect('paciente.trabalhos', 'trabalho')
      .leftJoinAndSelect('trabalho.servicos', 'servico')
      .leftJoinAndSelect('servico.elementos', 'elemento')
      .leftJoinAndSelect('trabalho.componentes', 'componenteTrabalho')
      .leftJoinAndSelect('componenteTrabalho.componente', 'componente')
      .leftJoinAndSelect('trabalho.ordemServico', 'ordemServico')
      .leftJoinAndSelect('trabalho.trabalhoMotivos', 'trabalhoMotivo')
      .leftJoinAndSelect('trabalhoMotivo.motivo', 'motivo');

    const result = await paciente.getOne();

    if (!result) {
      throw new NotFoundException(`Paciente com ID ${idPaciente} não encontrado.`);
    }

    if (result.trabalhos?.length) {
      for (const t of result.trabalhos) {
        const tms = t.trabalhoMotivos ?? [];
        (t as any).motivosRetrabalhoIds = tms
          .filter((tm: any) => tm.motivo?.tipo === MotivoTipo.RETRABALHO)
          .map((tm: any) => tm.idMotivo);
        (t as any).motivosBonificacaoIds = tms
          .filter((tm: any) => tm.motivo?.tipo === MotivoTipo.BONIFICACAO)
          .map((tm: any) => tm.idMotivo);
      }
    }

    return result;
  }


  async update(idPaciente: number, updatePacienteDto: UpdatePacienteDto, idEmpresa: number): Promise<Paciente> {
    const paciente = await this.findOne(idPaciente, idEmpresa);

    const nomeAtualizado = updatePacienteDto.nome?.toUpperCase().trim();
    const idProfissionalAtualizado = updatePacienteDto.idProfissional || paciente.idProfissional;

    if (nomeAtualizado && (nomeAtualizado !== paciente.nome || idProfissionalAtualizado !== paciente.idProfissional)) {
      const existingPaciente = await this.pacienteRepository.findOne({
        where: {
          nome: nomeAtualizado.toUpperCase().trim(),
          idEmpresa,
          idProfissional: idProfissionalAtualizado,
        },
      });
      if (existingPaciente && existingPaciente.idPaciente !== idPaciente) {
        throw new ConflictException(`Paciente com o nome "${updatePacienteDto.nome}" já existe para este dentista na empresa.`);
      }
    }

    Object.assign(paciente, updatePacienteDto);
    return this.pacienteRepository.save(paciente);
  }

  async updatePacienteETrabalhos(
    idPaciente: number,
    updateDto: UpdatePacienteDto,
    currentUser: any,
  ): Promise<Paciente> {
    const { trabalhos, ...pacienteData } = updateDto;
    // Prioriza o idEmpresa do DTO, mas usa o do usuário logado como fallback seguro.
    const idEmpresa = pacienteData.idEmpresa || currentUser.user.idEmpresa;

    if (!idEmpresa) {
      throw new BadRequestException('O ID da empresa não foi fornecido e não pôde ser determinado.');
    }

    const empresa = await this.empresaService.buscarEmpresasPorId(idEmpresa);

    // 1. Atualiza os dados do paciente
    const paciente = await this.update(idPaciente, { ...pacienteData, idEmpresa }, idEmpresa);

    // 2. Itera sobre os trabalhos para criar ou atualizar
    if (trabalhos && trabalhos.length > 0) {
      for (const trabalhoDto of trabalhos) {
        trabalhoDto.idPaciente = paciente.idPaciente; // Vincula o paciente

        // Garante que o idEmpresa do trabalho seja o mesmo do usuário logado,
        // prevenindo a inserção de um idEmpresa diferente no DTO.
        trabalhoDto.idEmpresa = idEmpresa;

        // Se o status não for definido, assume-se que é um novo trabalho pendente.
        if (!trabalhoDto.status) {
          trabalhoDto.status = StatusTrabalho.PENDENTE;
        }

        if (trabalhoDto.idTrabalho) {
          // Atualiza trabalho existente
          await this.trabalhoService.atualizarTrabalho(
            currentUser,
            trabalhoDto.idTrabalho,
            trabalhoDto,
          );
        } else {
          // Cadastra novo trabalho
          await this.trabalhoService.cadastrarTrabalho(
            currentUser,
            idEmpresa,
            empresa.nome,
            trabalhoDto,
          );
        }
      }
    }

    // Retorna o paciente atualizado com todos os seus trabalhos
    return this.findOne(idPaciente, idEmpresa);
  }

  async remove(idPaciente: number, idEmpresa: number): Promise<void> {
    const paciente = await this.findOne(idPaciente, idEmpresa);

    if (paciente.trabalhos && paciente.trabalhos.length > 0) {
      throw new BadRequestException('Não é possível excluir um paciente que possui trabalhos associados.');
    }

    // O TypeORM não consegue capturar o erro de FK do ON DELETE RESTRICT de forma elegante.
    // A verificação acima é a melhor abordagem.
    try {
      await this.pacienteRepository.softDelete(paciente.idPaciente);
    } catch (error) {
      // Fallback para caso a verificação acima falhe por alguma razão de concorrência.
      throw new BadRequestException('Não é possível excluir um paciente que possui trabalhos associados.');
    }
  }
}
