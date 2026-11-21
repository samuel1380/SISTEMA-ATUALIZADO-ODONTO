# Sistema Odontoprint Atualizado

Projeto completo do sistema Odontoprint com todas as melhorias e correções implementadas.

## Estrutura do Projeto

- `ang-odontoprint-master/`: Frontend da aplicação em Angular (modo escuro, nova gestão de faturas com alteração de competência, logs de auditoria em tempo real, devolução de componentes).
- `node-bff-odontoprint-master/`: Backend da aplicação em NestJS / TypeORM (regras financeiras corrigidas, índices de banco otimizados, job recorrente ajustado, novas rotas de alteração de período e movimentação de OS).
- `node-arqt-base-gerenciador-usuarios-main/`: Biblioteca base de autenticação e gerenciamento de usuários.
- Scripts de execução:
  - `INICIAR_SERVIDOR.bat`: Inicializa banco, backend e frontend localmente.
  - `PARAR_SERVIDOR.bat`: Encerra os serviços em execução.
  - `FAZER_BACKUP_BANCO.bat`: Gera backup completo (.sql) do banco local na Área de Trabalho com data e hora.
  - `CRIAR_LINK_PUBLICO.bat` / `iniciar_tunnel.ps1`: Inicializa o túnel Cloudflare para acesso público seguro.

