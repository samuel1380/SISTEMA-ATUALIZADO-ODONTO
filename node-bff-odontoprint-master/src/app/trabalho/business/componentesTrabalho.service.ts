import { Injectable } from '@nestjs/common';
import { ComponentesTrabalho } from '../domain/componentesTrabalho.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class ComponentesTrabalhoService {
  constructor(
    @InjectRepository(ComponentesTrabalho)
    private readonly componentesTrabalhoRepository: Repository<ComponentesTrabalho>
  ) { }

  async buscarComponentesTrabalho() {
    return this.componentesTrabalhoRepository.find();
  }

  async buscarPorIdTrabalho(idTrabalho: number): Promise<ComponentesTrabalho[]> {
    return this.componentesTrabalhoRepository.find({ where: { idTrabalho } });
  }

  /**
   * Persiste os componentes do trabalho: um registro por (idTrabalho, idComponente).
   * Substitui o upsert por idComponenteTrabalho, que gerava INSERT sem conflito quando o payload
   * vinha sem idComponenteTrabalho (ex.: seleção nova no front), duplicando linhas a cada edição.
   */
  async salvarComponentes(componentesTrabalho: ComponentesTrabalho[], idTrabalho: number) {
    const existentes = await this.componentesTrabalhoRepository.find({ where: { idTrabalho } });

    // Remove duplicatas históricas no banco (mesmo idComponente mais de uma linha), somando quantidades
    const vistoPorComponente = new Map<number, ComponentesTrabalho>();
    const duplicatas: ComponentesTrabalho[] = [];
    for (const row of existentes) {
      const idC = row.idComponente;
      if (vistoPorComponente.has(idC)) {
        const principal = vistoPorComponente.get(idC)!;
        principal.qtdItems = (principal.qtdItems ?? 0) + (row.qtdItems ?? 0);
        duplicatas.push(row);
      } else {
        vistoPorComponente.set(idC, row);
      }
    }
    if (duplicatas.length) {
      await this.componentesTrabalhoRepository.softRemove(duplicatas);
      await this.componentesTrabalhoRepository.save([...vistoPorComponente.values()]);
    }

    const unicosExistentes = [...vistoPorComponente.values()];

    if (!componentesTrabalho?.length) {
      if (unicosExistentes.length) {
        await this.componentesTrabalhoRepository.softRemove(unicosExistentes);
      }
      return;
    }

    const payload = componentesTrabalho.map((c) => {
      c.idTrabalho = idTrabalho;
      return c;
    });

    const idsDesejados = new Set(
      payload.map((c) => Number(c.idComponente)).filter((id) => !Number.isNaN(id) && id > 0),
    );

    for (const row of unicosExistentes) {
      if (!idsDesejados.has(row.idComponente)) {
        await this.componentesTrabalhoRepository.softRemove(row);
      }
    }

    const existentePorComponente = new Map(
      unicosExistentes.filter((e) => idsDesejados.has(e.idComponente)).map((e) => [e.idComponente, e]),
    );

    for (const c of payload) {
      const idComp = Number(c.idComponente);
      if (!idComp || Number.isNaN(idComp)) {
        continue;
      }

      const atual = existentePorComponente.get(idComp);
      if (atual) {
        atual.qtdItems = c.qtdItems;
        atual.idTrabalho = idTrabalho;
        await this.componentesTrabalhoRepository.save(atual);
      } else {
        const novo = this.componentesTrabalhoRepository.create({
          idTrabalho,
          idComponente: idComp,
          qtdItems: c.qtdItems,
          ativo: 1,
        });
        await this.componentesTrabalhoRepository.save(novo);
        existentePorComponente.set(idComp, novo);
      }
    }
  }
}
