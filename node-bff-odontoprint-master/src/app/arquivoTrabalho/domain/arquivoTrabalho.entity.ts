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
import { Trabalho } from '../../trabalho/domain/trabalho.entity';

@Entity('TbArquivoTrabalho')
export class ArquivoTrabalho {
  @PrimaryGeneratedColumn()
  idArquivoTrabalho?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nomeArquivo: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nomeOriginal: string;

  @Column({ type: 'varchar', nullable: false })
  path?: string;

  @Column({ type: 'varchar', nullable: false })
  bucket?: string;

  @Column({ type: 'int', nullable: false })
  tamanho?: number;

  @Column({ type: 'varchar', nullable: false })
  tipo: string;

  @Column({ type: 'int', nullable: true })
  ordem?: number;

  @Column({ type: 'int', nullable: false })
  idTrabalho?: number;

  @Column({ type: 'int', nullable: false })
  idEmpresa?: number;

  @Column({ type: "boolean", default: true })
  ativo: number;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  // @ManyToOne(type => Trabalho, (trabalho) => trabalho.arquivos)
  // @JoinColumn({ name: 'idTrabalho' })
  // trabalho?: Trabalho;
}
