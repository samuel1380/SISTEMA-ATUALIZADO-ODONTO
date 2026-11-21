import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TbConfiguracaoKm')
export class ConfiguracaoKm {
  @PrimaryGeneratedColumn()
  idConfiguracaoKm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorPorKm: number;

  @CreateDateColumn()
  dataInclusao: Date;

  @UpdateDateColumn()
  dataAlteracao: Date;
}

