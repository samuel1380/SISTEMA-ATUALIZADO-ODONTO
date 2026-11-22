# Sistema Odontoprint Atualizado

Projeto completo do sistema Odontoprint com todas as melhorias e correções implementadas.

## Estrutura do Projeto

- `ang-odontoprint-master/`: Frontend da aplicação em Angular (modo escuro, nova gestão de faturas com alteração de competência, logs de auditoria em tempo real, devolução de componentes, data/hora de envio de trabalhos).
- `node-bff-odontoprint-master/`: Backend da aplicação em NestJS / TypeORM (regras financeiras corrigidas, índices de banco otimizados, job recorrente ajustado, novas rotas de alteração de período e movimentação de OS, auditoria com AuditInterceptor).
- `node-arqt-base-gerenciador-usuarios-main/`: Biblioteca base de autenticação e gerenciamento de usuários.
- `scripts/migracao-aws-producao.sql`: Script SQL seguro e 100% idempotente para atualizar o banco existente na AWS (RDS / Aurora) sem perder dados.
- `GUIA_DEPLOY_AWS.md`: Guia passo a passo completo, detalhado e à prova de falhas para deploy em produção (EC2, Amplify e RDS/Aurora).
- Scripts de execução:
  - `INICIAR_SERVIDOR.bat`: Inicializa banco, backend e frontend localmente.
  - `PARAR_SERVIDOR.bat`: Encerra os serviços em execução.
  - `FAZER_BACKUP_BANCO.bat`: Gera backup completo (.sql) do banco local na Área de Trabalho com data e hora.
  - `USAR_BANCO_PRODUCAO.bat` / `USAR_BANCO_TESTE.bat`: Alterna entre banco limpo e de testes.
  - `CRIAR_LINK_PUBLICO.bat` / `iniciar_tunnel.ps1`: Inicializa o túnel Cloudflare para acesso público seguro.


