import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Almoxarifado } from '../domain/almoxarifado.entity';
import { CreateAlmoxarifadoDto } from '../domain/dto/create-almoxarifado.dto';
import { UpdateAlmoxarifadoDto } from '../domain/dto/update-almoxarifado.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { EmpresaCreatedEvent } from '../../estoque/events/empresa-created.events';

@Injectable()
export class AlmoxarifadoService {
  constructor(
    @InjectRepository(Almoxarifado)
    private readonly almoxarifadoRepository: Repository<Almoxarifado>,
    private readonly logger: Logger = new Logger(AlmoxarifadoService.name),
  ) {}

  create(createAlmoxarifadoDto: CreateAlmoxarifadoDto): Promise<Almoxarifado> {
    const almoxarifado = this.almoxarifadoRepository.create(createAlmoxarifadoDto);
    return this.almoxarifadoRepository.save(almoxarifado);
  }

  findAll(): Promise<Almoxarifado[]> {
    return this.almoxarifadoRepository.find();
  }

  async findOne(id: number): Promise<Almoxarifado> {
    const almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idAlmoxarifado: id } });
    if (!almoxarifado) {
      throw new NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
    }
    return almoxarifado;
  }

  async findOneByEmpresa(idEmpresa: number): Promise<Almoxarifado> {
    let almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idEmpresa } });
    if (!almoxarifado) {
      almoxarifado = await this.almoxarifadoRepository.findOne({ where: { idEmpresa: 1 } });
    }
    if (!almoxarifado) {
      const primeiro = await this.almoxarifadoRepository.findOne({ where: {} });
      if (primeiro) {
        return primeiro;
      }
      almoxarifado = await this.create({
        nome: `Almoxarifado Principal`,
        descricao: `Almoxarifado padrão do sistema`,
        idEmpresa: idEmpresa || 1,
      });
    }
    return almoxarifado;
  }

  async update(id: number, updateAlmoxarifadoDto: UpdateAlmoxarifadoDto): Promise<Almoxarifado> {
    const almoxarifado = await this.almoxarifadoRepository.preload({ idAlmoxarifado: id, ...updateAlmoxarifadoDto });
    if (!almoxarifado) {
      throw new NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
    }
    return this.almoxarifadoRepository.save(almoxarifado);
  }

  async remove(id: number): Promise<void> {
    const result = await this.almoxarifadoRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Almoxarifado com ID "${id}" não encontrado.`);
    }
  }

  @OnEvent('empresa.created', { async: true })
  async handleTrabalhoCriadoEvent(payload: EmpresaCreatedEvent) {
    this.logger.log(`Recebido evento 'empresa.created'. Criando almoxarifado para a empresa ${payload.idEmpresa}.`)

    const almoxarifadoExistente = await this.almoxarifadoRepository.findOne({ where: { idEmpresa: payload.idEmpresa } });
    if (almoxarifadoExistente) {
      this.logger.log(`Almoxarifado para a empresa ${payload.idEmpresa} já existe.`)
      return;
    }

    const novoAlmoxarifado = this.almoxarifadoRepository.create({
      idEmpresa: payload.idEmpresa,
      nome: payload.nome,
    });

    await this.almoxarifadoRepository.save(novoAlmoxarifado);
  }
}
