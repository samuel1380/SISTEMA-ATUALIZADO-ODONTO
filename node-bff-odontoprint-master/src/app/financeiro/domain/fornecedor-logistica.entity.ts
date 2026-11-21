import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum TipoFornecedorLogistica {
  TRANSPORTADORA = 'TRANSPORTADORA',
  CORREIOS = 'CORREIOS',
  ENTREGA_RAPIDA = 'ENTREGA_RAPIDA',
  OUTRO = 'OUTRO',
}

@Entity('TbFornecedorLogistica')
export class FornecedorLogistica {
  @PrimaryGeneratedColumn()
  idFornecedorLogistica: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'enum', enum: TipoFornecedorLogistica })
  tipo: TipoFornecedorLogistica;

  @Column({ length: 255, nullable: true })
  contato?: string;

  @Column({ length: 100, nullable: true })
  telefone?: string;

  @Column({ length: 100, nullable: true })
  email?: string;

  @Column({ nullable: true })
  idEmpresa?: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;

  @DeleteDateColumn()
  dataExclusao: Date;
}

