import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementosTrabalho } from '../domain/elementosTrabalho.entity';

@Injectable()
export class ElementosTrabalhoService {

  constructor(
    @InjectRepository(ElementosTrabalho)
    private readonly elementosTrabalhoRepository: Repository<ElementosTrabalho>
  ) { }

  async buscarElementosTrabalho() {
    return this.elementosTrabalhoRepository.find();;
  }
}
