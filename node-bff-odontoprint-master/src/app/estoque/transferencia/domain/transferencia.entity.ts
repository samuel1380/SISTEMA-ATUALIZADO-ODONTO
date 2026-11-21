import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Almoxarifado } from '../../almoxarifado/domain/almoxarifado.entity';
import { Componente } from '@src/app/componente/domain/componente.entity';

@Entity('TbTransferencia')
export class Transferencia {
  @PrimaryGeneratedColumn()
  idTransferencia: number;

  @Column({ type: 'int', nullable: true })
  idAlmoxarifadoOrigem?: number;

  @Column()
  idAlmoxarifadoDestino: number;

  @Column()
  idComponente: number;

  @Column({ type: 'int' })
  quantidade: number;
  
  @Column({ type: 'boolean', default: false })
  baixado: boolean;

  @ManyToOne(() => Almoxarifado, { eager: true })
  @JoinColumn({ name: 'idAlmoxarifadoOrigem', referencedColumnName: 'idAlmoxarifado' })
  almoxarifadoOrigem: Almoxarifado;

  @ManyToOne(() => Almoxarifado, { eager: true })
  @JoinColumn({ name: 'idAlmoxarifadoDestino', referencedColumnName: 'idAlmoxarifado' })
  almoxarifadoDestino: Almoxarifado;

  @ManyToOne(() => Componente, { eager: true })
  @JoinColumn({ name: 'idComponente' })
  componente: Componente;

  @CreateDateColumn()
  dataTransferencia: Date;
}
