import { Injectable, NotFoundException } from '@nestjs/common';
import { Componente } from '../domain/componente.entity';
import { ComponenteDto } from '../dto/componente.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ComponenteService {
  constructor(
    @InjectRepository(Componente)
    private readonly componenteRepository: Repository<Componente>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async cadastrarComponente(currentUser: any, componenteDto: ComponenteDto): Promise<Componente> {
    const componente = this.componenteRepository.create({
      ...componenteDto,
      ativo: 1,
      idUsuarioCadastro: currentUser.user.idUsuario,
    });
    return this.componenteRepository.save(componente);
  }

  async editarComponente(
    currentUser: any,
    idComponente: number,
    componenteDto: Partial<ComponenteDto>,
  ): Promise<Componente> {
    const componente = await this.componenteRepository.preload({
      idComponente,
      ...componenteDto,
    });

    if (!componente) {
      throw new NotFoundException(`Componente com ID ${idComponente} não encontrado.`);
    }

    const componenteAtualizado = await this.componenteRepository.save(componente);

    this.eventEmitter.emit('preco.changed', currentUser);

    return componenteAtualizado;
  }

  async buscaComponentesAtivos(): Promise<Componente[]> {
    return this.componenteRepository.find({ where: { ativo: 1 } });
  }

  async buscaComponentePorId(idComponente: number): Promise<Componente | null> {
    return this.componenteRepository.findOne({where : { idComponente } });
  }
}

