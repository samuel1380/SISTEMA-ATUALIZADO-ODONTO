# 🚀 GUIA DEFINITIVO E À PROVA DE FALHAS: DEPLOY ODONTOPRINT NA AWS
> **Backend:** EC2 (`api.labodontoprint.com.br` / NestJS)  
> **Frontend:** AWS Amplify (Angular 17)  
> **Banco de Dados:** AWS RDS / Aurora MySQL  
> **Arquivos:** AWS S3 (`odontoprintfileserver`)  

---

## ✋ REGRA DE OURO ANTES DE COMEÇAR (LEIA COM ATENÇÃO!)
> *"Quem faz deploy na sexta ou sem backup não tem medo de sofrer, tem certeza absoluta."*  
> O seu banco de produção no RDS/Aurora tem dados reais de clientes, trabalhos e faturamento. **NUNCA**, sob hipótese alguma:
> 1. Rode comandos `DROP TABLE` ou `DROP DATABASE`.
> 2. Configure `synchronize: true` no TypeORM (ele já está desativado com segurança).
> 
> O script que preparamos (`scripts/migracao-aws-producao.sql`) é **100% idempotente, não-destrutivo e case-insensitive**:
> - Ele só cria tabelas e colunas que ainda não existirem.
> - Preserva rigorosamente cada linha existente no seu banco.
> - Faz backfill automático de datas de trabalhos já enviados.
> - Trata variações de maiúsculas/minúsculas no MySQL do RDS/Linux.
> - Pode ser rodado 1 vez ou 50 vezes seguidas com total segurança.

---

## 📋 CHECKLIST GERAL DAS ETAPAS
- [ ] **Etapa 1:** Backup Completo e Snapshot do Banco no RDS / Aurora
- [ ] **Etapa 2:** Execução do Script de Migração SQL (`migracao-aws-producao.sql`)
- [ ] **Etapa 3:** Deploy e Atualização do Backend no EC2 (NestJS + PM2)
- [ ] **Etapa 4:** Deploy do Frontend no AWS Amplify (Angular 17)
- [ ] **Etapa 5:** Checklist de Validação Pós-Deploy

---

## 🛠️ ETAPA 1: BACKUP DE SEGURANÇA (O SALVA-VIDAS)

Antes de alterar qualquer vírgula, garanta seu backup:

### Opção A: Snapshot Manual pelo Console da AWS (Mais Rápido e Seguro)
1. Acesse o **Console da AWS** -> Serviço **RDS** (ou **Aurora**).
2. Vá em **Databases** e localize a instância ou cluster de produção do Odontoprint.
3. Clique em **Actions** (Ações) -> **Take Snapshot** (Criar Instantâneo).
4. Dê um nome bem claro, por exemplo: `backup-pre-atualizacao-logs-2026-11-22`.
5. Clique em **Take Snapshot** e aguarde o status ficar **Available** (Verde).  
   *(Pronto! Se cair um meteoro no banco, em 2 cliques você restaura o snapshot intacto).*

### Opção B: Dump SQL via Terminal / Computador Local
Se quiser uma cópia física `.sql` salva no seu computador:
```bash
mysqldump -h SEU-ENDPOINT-RDS.us-east-1.rds.amazonaws.com -u odontoprint -p odontoprint_db > backup_odontoprint_producao.sql
```

---

## 🗄️ ETAPA 2: MIGRAÇÃO DO BANCO DE DADOS (RDS / AURORA)

O script está pronto, testado e validado em:
📁 [scripts/migracao-aws-producao.sql](file:///C:/Users/samuel/OneDrive/Área%20de%20Trabalho/SISTEMA-ATUALIZADO-ODONTO/scripts/migracao-aws-producao.sql)  
*(Cópia idêntica também em `node-bff-odontoprint-master/structDB/scriptsAlteracao/49_migracao_aws_producao.sql`).*

### O que este script faz:
1. **Auditoria e Logs:** Cria a tabela `TbLogAuditoria` e seus índices para consultas ultrarrápidas em tempo real.
2. **Trabalhos:** Adiciona com segurança em `TbTrabalho`:
   - `dataHoraEnvio` (DATETIME): para marcar a hora exata do envio/conclusão.
   - `ocultoConcluido` (TINYINT): para ocultar/desarquivar trabalhos da dashboard.
   - `descricaoTrabalho`, `cor`, `descricaoComponente`, `observacao`, `anotacoes`, `retrabalho`, `bonificacao`, etc.
3. **Módulos Complementares:** Cria com `CREATE TABLE IF NOT EXISTS` todas as tabelas e colunas auxiliares do sistema que possam faltar se a versão do banco for antiga:
   - `TbPaciente`, `TbAlmoxarifado`, `TbEstoque`, `TbTransferencia`, `TbEstoqueHistoricoConsumo`.
   - `TbDevolucaoComponente`, `TbFaturaDevolucaoItem`, `TbMotivo`, `TbTrabalhoMotivo`.
   - `TbEmpresaTabelaPreco`, `TbFinanceiroFornecedor`, `TbFinanceiroLancamentoRecorrente`.
   - `TbSocio`, `TbCredor`, `TbAporte`, `TbRetirada`, `TbEmprestimo`, `TbEmprestimoMovimentacao`.
   - `TbConfiguracaoKm`, `TbPagamentoKm`, `TbVeiculo`, `TbAbastecimento`, `TbFornecedorLogistica`, `TbEntrega`.
   - `TbArquivoOfx`, `TbTransacaoOfx`, `TbConciliacaoTransacao`.
   - `TbGrupoPermissao`, `TbGrupoPermissaoTbPermissao`.
   - `TbFinanceiroFatura` (`descontoDevolucao`, `idFaturaOriginal`, `descricao`, `desconto`, `anotacoes`).
4. **Renomeação Segura de Tabelas Legadas:** Converte automaticamente `TbFinanceiro` -> `TbOrdemServico` e `TbFinanceiroItem` -> `TbOrdemServicoItem` se o banco ainda estiver com a nomenclatura antiga.
5. **Backfill automático:** Para todos os trabalhos que já estavam com status `ENVIADO` ou `PAGAMENTO_RECEBIDO`, preenche `dataHoraEnvio` automaticamente usando a `dataConclusao` (ou data atual), evitando nulos em telas e relatórios.

### Como Executar:

#### Via DBeaver ou MySQL Workbench (Recomendado):
1. Conecte-se ao seu banco de dados AWS RDS / Aurora.
2. Certifique-se de selecionar a base:
   ```sql
   USE odontoprint_db;
   ```
3. Abra o arquivo `scripts/migracao-aws-producao.sql`.
4. Execute o script completo (ícone de raio ou `Ctrl+Shift+Enter`).
5. Verifique a mensagem final no resultado:
   `MIGRACAO PARA AWS CONCLUIDA COM SUCESSO E SEM PERDA DE DADOS!`

#### Via Linha de Comando (no EC2 ou máquina com acesso ao RDS):
```bash
mysql -h SEU-ENDPOINT-RDS.us-east-1.rds.amazonaws.com -u odontoprint -p odontoprint_db < scripts/migracao-aws-producao.sql
```

---

## 🖥️ ETAPA 3: DEPLOY DO BACKEND NO EC2 (NESTJS)

O backend roda na porta `3002` no servidor EC2 (domínio `api.labodontoprint.com.br`).

### 1. Conectar na Máquina EC2 via SSH:
Abra o terminal no diretório onde está a sua chave `.pem`:
```bash
ssh -i acesso_odontoprint.pem ubuntu@api.labodontoprint.com.br
```
*(Ou use o IP público da sua instância EC2 se o DNS não estiver resolvendo)*.

### 2. Acessar a Pasta do Projeto:
Geralmente o projeto fica em `/var/www/` ou `/home/ubuntu/`:
```bash
cd /home/ubuntu/SISTEMA-ATUALIZADO-ODONTO # ou a pasta onde você clonou o repositório
```

### 3. Atualizar o Código via Git:
```bash
git fetch origin
git checkout frontend  # ou a branch que você utiliza em produção
git pull origin frontend
```

### 4. Compilar Primeiro a Biblioteca Base de Usuários:
> **Atenção:** O backend depende localmente da pasta `node-arqt-base-gerenciador-usuarios-main`. Sempre compile ela primeiro!
```bash
cd node-arqt-base-gerenciador-usuarios-main
npm install --legacy-peer-deps
npm run build
cd ../node-bff-odontoprint-master
```

### 5. Verificar o Arquivo `.env`:
Confira se as variáveis de ambiente de produção estão corretas:
```bash
nano .env
```
*(Você pode usar como modelo o arquivo `.env.production.example` que deixamos pronto).*  
Certifique-se de que:
- `NODE_ENV=production`
- `PORT=3002`
- `DATABASE_HOST=` aponta para o Endpoint do RDS/Aurora.
- `DATABASE_NAME=odontoprint_db`
- `CHAVE_SECRETA` e `CHAVE_SECRETA_JWT` estão configuradas.

### 6. Instalar Dependências e Compilar o Backend:
```bash
npm install --legacy-peer-deps
npm run build
```
Certifique-se de que a compilação gerou a pasta `dist/src/main.js` sem nenhum erro.

### 7. Reiniciar o Processo no PM2:
Veja o status dos processos:
```bash
pm2 status
```
Reinicie o processo existente ou inicie com o arquivo de configuração que preparamos:
```bash
# Se o processo odontoprint-backend já estiver cadastrado:
pm2 reload odontoprint-backend --update-env

# OU se ainda não estiver usando ecosystem:
pm2 start ecosystem.config.js
pm2 save
```

### 8. Checar os Logs do Backend:
```bash
pm2 logs odontoprint-backend --lines 50
```
Verifique se aparece:
`Nest application successfully started` e sem nenhum erro de conexão com o banco!

---

## 🌐 ETAPA 4: DEPLOY DO FRONTEND NO AWS AMPLIFY (ANGULAR 17)

O frontend roda no AWS Amplify e compila automaticamente a partir do Git.

### 1. Enviar as Alterações para o Repositório:
No seu computador local:
```bash
git add .
git commit -m "feat: atualizacao completa logs, data de envio de trabalhos e responsividade"
git push origin frontend
```

### 2. Acompanhar a Build no AWS Amplify:
1. Abra o **AWS Console** -> **AWS Amplify**.
2. Clique no app do **Odontoprint**.
3. O Amplify iniciará o ciclo automático:
   - **Provision**
   - **Build** (Instalação e compilação do Angular 17)
   - **Deploy** (Distribuição CDN CloudFront)
   - **Verify**

### 3. Conferir as Configurações de Build do Amplify (Monorepo):
No console do Amplify -> **App settings** -> **Build settings**:  
Como o repositório é monorepo (frontend e backend na mesma raiz), o `amplify.yml` precisa ter o bloco `applications: - appRoot: ang-odontoprint-master`:

```yaml
version: 1
applications:
  - appRoot: ang-odontoprint-master
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci --legacy-peer-deps || npm install --legacy-peer-deps
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist/ang-odontoprint
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```
*(O arquivo `amplify.yml` já está criado na raiz do repositório exatamente assim).*

### 4. Conferir Regras de Redirecionamento (Rewrites / Reverse Proxy):
No console do Amplify -> **App settings** -> **Rewrites and redirects**:  
O Angular faz chamadas relativas (ex: `/logs`, `/trabalho`, etc.). O Amplify precisa encaminhar essas chamadas para a EC2 e deixar as rotas de tela para o `index.html` (SPA).

Configure as regras nesta ordem:

#### Regra 1: Proxy de TODAS as rotas da API para o Backend na EC2
- **Source address (Origem):**
  `</^(auth|login|usuario|empresa|trabalho|dentista|pedido|produto|produtoempresa|produtos-empresa|categoriaproduto|categoria-produto|cor|cor-empresa|corempresa|marca-componente|marcacomponente|componente|componente-empresa|componenteempresa|estoque|transferencia|almoxarifado|financeiro|motivo|localidade|cadastro-complementar-empresa|cadastrocomplementar|tabela-preco-produto|tabelaPrecoProduto|empresa-tabela-preco|historico-status-trabalho|historicoStatusTrabalho|paciente|ordem-servico|foto-paciente|arquivo-trabalho|arquivo|componentesTrabalho|elementosTrabalho|trabalhoconcluidos|trabalhopendentes|ordenatrabalhos|relatorio|categoria|logs)(.*)/>`
- **Target address (Destino):**
  `https://api.labodontoprint.com.br/$1$2`
- **Type (Tipo):**
  `200 (Rewrite)`

> **Nota:** Se você já tinha regras individuais cadastradas anteriormente no Amplify (ex: `^/trabalho<*>`, `^/auth<*>`), você só precisa garantir que adicionou a regra para o novo módulo de logs:
> - Origem: `^/logs<*>`
> - Destino: `https://api.labodontoprint.com.br/logs<*>`
> - Tipo: `200 (Rewrite)`
> Coloque-a **acima** da regra do `index.html`.

#### Regra 2: Roteamento SPA do Angular (Deve ser a ÚLTIMA regra)
- **Source address (Origem):**
  `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
- **Target address (Destino):**
  `/index.html`
- **Type (Tipo):**
  `200 (Rewrite)`

---

## 🎯 ETAPA 5: CHECKLIST DE VALIDAÇÃO PÓS-DEPLOY

Abra a aplicação em produção no navegador e teste os novos recursos:

1. **Login de Administrador:**
   - Faça login com um usuário admin.
   - Verifique se a dashboard carrega normalmente com todos os dados existentes.
2. **Nova Tela de Logs e Auditoria (`/logs`):**
   - Acesse o menu **Logs** (ícone no menu lateral ou cabeçalho).
   - Verifique se o histórico carrega com paginação, filtros e detalhes de alterações (dados anteriores vs novos).
   - O endpoint `GET /logs` deve responder 200 OK.
3. **Hora e Data de Envio dos Trabalhos:**
   - Vá na lista de **Trabalhos Concluídos / Enviados**.
   - Verifique se a coluna com a **Data e Hora de Envio** está preenchida e formatada.
   - Mude um trabalho de teste para o status `ENVIADO` e confira se a hora atual foi gravada no banco e no log de auditoria.
4. **Ocultar / Desarquivar Trabalho:**
   - Clique no botão de ocultar trabalho concluído.
   - Verifique se ele some da listagem principal e aparece ao marcar a opção "Exibir Ocultos".
5. **Responsividade Mobile:**
   - Abra o sistema no celular ou no modo responsivo do Chrome (`F12` -> `Ctrl+Shift+M`).
   - Teste o menu retrátil, tabelas adaptadas e botões em tela reduzida.

---

## 🆘 TROUBLESHOOTING (O QUE FAZER SE ALGO DER ERRADO?)

- **Erro `Column 'dataHoraEnvio' unknown` no backend:**
  - O script SQL de migração da Etapa 2 não foi executado ou foi rodado no banco errado. Execute novamente o `scripts/migracao-aws-producao.sql` no banco de produção.
- **Backend dá erro `ECONNREFUSED` ao iniciar no EC2:**
  - O Security Group do RDS/Aurora precisa liberar a porta 3306 para o Security Group da EC2 (ou IP privado da EC2).
- **Tela em branco no Amplify ao recarregar a página (F5):**
  - Falta a regra de Rewrite SPA no Amplify (`</^[^.]+$.../>` apontando para `/index.html` com status `200`).
- **Endpoint `/logs` retorna 404 em produção:**
  - Falta a regra de proxy do `/logs<*>` para a EC2 nas configurações de *Rewrites and redirects* do Amplify. Adicione conforme a Etapa 4 e salve.
- **Amplify dá erro de build "Cannot find module" ou "package.json not found":**
  - Garanta que nas configurações de Build do Amplify o `appRoot` está definido como `ang-odontoprint-master`.

---
**Tudo pronto, testado em banco real e compilado para produção! Pode subir com total tranquilidade.**
