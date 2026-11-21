import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { Trabalho } from '@src/app/trabalho/domain/trabalho.entity';
import { OrdemServicoItem } from './ordemServicoItem.entity';
import { Fatura } from '@src/app/financeiro/domain/fatura.entity';

export enum StatusOrdemServico {
  PENDENTE = 'PENDENTE',
  RECEBER = 'RECEBER',
  EM_FATURA = 'EM_FATURA',
  PAGO = 'PAGO',
}

@Entity('TbOrdemServico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  idOrdemServico?: number;
  
  @Column({ type: 'int', nullable: false })
  idTrabalho: number;

  @Column({ type: 'int', nullable: true })
  idFatura?: number;

  @ManyToOne(() => Fatura, (fatura) => fatura.ordensDeServico)
  @JoinColumn({ name: 'idFatura' })
  fatura?: Fatura;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: 'varchar', nullable: false })
  status: StatusOrdemServico;

  @Column({ type: 'decimal', nullable: false })
  valorTotal: number;

  @Column({ type: "boolean", default: true, select: false })
  concluido: boolean;

  @Column({ type: 'datetime', nullable: true })
  dataConcluido?: Date;

  @Column({ type: "boolean", default: true, select: false })
  ativo: boolean;

  @Column({ type: 'int', nullable: false, select: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  @Column({ select: false })
  dataInclusao?: Date;

  @UpdateDateColumn()
  @Column({ select: false })
  dataAlteracao?: Date;

  @DeleteDateColumn()
  @Column({ select: false })
  dataExclusao?: Date;

  @OneToOne(type => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;

  @OneToOne(type => Trabalho, { eager: true })
  @JoinColumn({ name: 'idTrabalho' })
  trabalho: Trabalho;

  @OneToMany(() => OrdemServicoItem, (item) => item.ordemServico, { eager: true, cascade: true, orphanedRowAction: 'delete' })
  itens?: OrdemServicoItem[];
}
