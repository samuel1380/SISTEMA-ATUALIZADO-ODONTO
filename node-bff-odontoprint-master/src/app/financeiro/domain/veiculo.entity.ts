import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('TbVeiculo')
export class Veiculo {
  @PrimaryGeneratedColumn()
  idVeiculo: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;

  @DeleteDateColumn()
  dataExclusao: Date;
}

