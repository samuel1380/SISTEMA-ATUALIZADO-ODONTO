import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('TbLogAuditoria')
export class LogAuditoria {
  @PrimaryGeneratedColumn()
  idLog: number;

  @CreateDateColumn({ type: 'datetime' })
  dataHora: Date;

  @Column({ type: 'int', nullable: true })
  idUsuario?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeUsuario?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailUsuario?: string | null;

  @Column({ type: 'varchar', length: 50, default: 'ACAO' })
  acao: string;

  @Column({ type: 'varchar', length: 100, default: 'GERAL' })
  modulo: string;

  @Column({ type: 'varchar', length: 100, default: 'Sistema' })
  entidade: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idRegistro?: string | null;

  @Column({ type: 'text' })
  resumo: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  metodoHttp?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rota?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ip?: string | null;

  @Column({ type: 'longtext', nullable: true })
  dadosAnteriores?: string | null;

  @Column({ type: 'longtext', nullable: true })
  dadosNovos?: string | null;

  @Column({ type: 'longtext', nullable: true })
  camposAlterados?: string | null;

  @Column({ type: 'int', nullable: true, default: 200 })
  statusHttp?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idRequisicao?: string | null;
}
