import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Trabalho } from '@src/app/trabalho/domain/trabalho.entity';

@Entity('TbHistoricoStatusTrabalho')
export class HistoricoStatusTrabalho {
  @PrimaryGeneratedColumn()
  idHistoricoStatusTrabalho?: number;

  @Column({ type: 'varchar', nullable: false })
  nome: string;
  
  @Column({ type: 'int', nullable: false })
  idTrabalho: number;

  @Column({ type: 'varchar', nullable: false })
  statusAterior: string;

  @Column({ type: 'varchar', nullable: false })
  statusAtual: string;

  @Column({ type: "boolean", default: true, select: false })
  ativo: number;

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

  @ManyToOne(type => Trabalho, (componente) => componente.historicoStatusTrabalho)
  @JoinColumn({ name: 'idTrabalho' })
  trabalho?: Trabalho;

}
