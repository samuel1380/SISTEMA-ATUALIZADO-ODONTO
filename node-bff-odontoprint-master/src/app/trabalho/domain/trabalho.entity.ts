import {
  Column,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Empresa } from '@hunter-solucoes/node-arqt-base-gerenciador-usuarios/dist/src/app/empresa/domain/empresa.entity';
import { ComponentesTrabalho } from './componentesTrabalho.entity';
import { Dentista } from '@src/app/dentista/domain/dentista.entity';
import { HistoricoStatusTrabalho } from '@src/app/historicoStatusTrabalho/domain/historicoStatusTrabalho.entity';
import { OrdemServico } from '@src/app/ordemServico/domain/ordemServico.entity';
import { ServicoTrabalho } from './servicoTrabalho.entity';
import { Paciente } from '../../paciente/domain/paciente.entity';
import { TabelaPrecoProduto } from '@src/app/tabelaPrecoProduto/domain/tabelaPrecoProduto.entity';
import { TrabalhoMotivo } from './trabalhoMotivo.entity';



export enum StatusTrabalho {
  PENDENTE = 'PENDENTE',
  MODELAGEM = 'MODELAGEM',
  IMPRESSAO_PROVA = 'IMPRESSAO_PROVA',
  IMPRESSAO_CARGA_CERAMICA = 'IMPRESSAO_CARGA_CERAMICA',
  IMPRESSAO_BIOSPLINT_PLACA = 'IMPRESSAO_BIOSPLINT_PLACA',
  FRESAGEM = 'FRESAGEM',
  SINTERIZACAO = 'SINTERIZACAO',
  MAQUIAGEM = 'MAQUIAGEM',
  AGUARDANDO_COMPONENTE = 'AGUARDANDO_COMPONENTE',
  PACOTE = 'PACOTE',
  AGUARDANDO_COLETA = 'AGUARDANDO_COLETA',
  ENVIADO = 'ENVIADO',
  ENVIADO_PROVA = 'ENVIADO_PROVA',
  PAGAMENTO_RECEBIDO = 'PAGAMENTO_RECEBIDO',
  CANCELADO = 'CANCELADO',
}

@Entity('TbTrabalho')
export class Trabalho {
  @PrimaryGeneratedColumn()
  idTrabalho?: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nomePaciente?: string;

  @Column({ type: 'int', nullable: false })
  idEmpresa: number;

  @Column({ type: 'varchar', nullable: true })
  nomeEmpresa?: string;

  @Column({ type: 'int', nullable: true }) // Nullable para permitir a migração
  idPaciente: number;

  @Column({ type: 'int', nullable: false })
  idProfissional: number;

  @Column({ type: 'varchar', nullable: false })
  descricaoTrabalho: string;

  @Column({ type: 'varchar', nullable: false })
  cor: string;

  @Column({ type: 'varchar', nullable: false })
  descricaoComponente: string;
  
  @Column({ type: 'varchar', nullable: false })
  observacao: string;

  @Column({ type: 'varchar', nullable: true })
  anotacoes?: string;

  @Column({ type: "boolean", default: false, nullable: true })
  retrabalho?: boolean;

  @Column({ type: "boolean", default: false, nullable: true })
  bonificacao?: boolean;

  @Column()
  idTrabalhoOrigem?: number;

  @Column()
  status: StatusTrabalho;

  @Column()
  ordem: number;

  @Column({ type: 'datetime', nullable: true })
  dataConclusao?: Date;

  @Column({ type: 'int', nullable: true })
  idTabelaPrecoProduto?: number;

  @Column({ type: "boolean", default: true })
  ativo: boolean;

  @Column({ type: "boolean", default: false, nullable: true })
  finalizado?: boolean;

  @Column({ type: 'int', nullable: false })
  idUsuarioCadastro: number;

  @CreateDateColumn()
  dataInclusao?: Date;

  @UpdateDateColumn()
  dataAlteracao?: Date;

  @DeleteDateColumn()
  dataExclusao?: Date;

  @OneToOne(type => Dentista, { eager: true })
  @JoinColumn({ name: 'idProfissional' })
  dentista: Dentista;

  @OneToOne(type => Empresa, { eager: true })
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;
  
  @ManyToOne(() => Paciente, { eager: true })
  @JoinColumn({ name: 'idPaciente' })
  paciente: Paciente;

  @OneToMany(type => ComponentesTrabalho, (componenteTrabalho) => componenteTrabalho.trabalho, { eager: true })
  componentes?: ComponentesTrabalho[]
  
  @OneToMany(() => ServicoTrabalho, (servico) => servico.trabalho, { eager: true, cascade: true })
  servicos?: ServicoTrabalho[];

  @OneToMany(() => TrabalhoMotivo, (trabalhoMotivo) => trabalhoMotivo.trabalho, { eager: true })
  trabalhoMotivos?: TrabalhoMotivo[];

  @OneToMany(type => HistoricoStatusTrabalho, (historicoStatusTrabalho) => historicoStatusTrabalho.trabalho, { eager: true })
  historicoStatusTrabalho?: HistoricoStatusTrabalho[];

  @OneToOne(() => OrdemServico, (ordemServico) => ordemServico.trabalho)
  ordemServico?: OrdemServico;

  @ManyToOne(() => TabelaPrecoProduto, { eager: false })
  @JoinColumn({ name: 'idTabelaPrecoProduto' })
  tabelaPrecoProduto?: TabelaPrecoProduto;
}
