param (
    [string]$Mensagem = "feat: atualizacoes no frontend"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SINCRONIZANDO FRONTEND COM GITHUB / AWS " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Comitar no repositório geral
Write-Host "`n1. Salvando alteracoes locais..." -ForegroundColor Yellow
git add ang-odontoprint-master
try {
    git commit -m "$Mensagem"
} catch {
    Write-Host "Nenhuma alteracao pendente no frontend." -ForegroundColor Gray
}

# 2. Atualizar a branch deploy-frontend
Write-Host "`n2. Extraindo arquivos do frontend para a branch..." -ForegroundColor Yellow
git subtree split --prefix=ang-odontoprint-master -b deploy-frontend

# 3. Enviar para o repositório front-sistema-atualizado-
Write-Host "`n3. Enviando para o GitHub (front-sistema-atualizado-)..." -ForegroundColor Yellow
git push front deploy-frontend:main --force

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  ENVIADO COM SUCESSO!                     " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "O AWS Amplify vai detectar o commit automaticamente e iniciar o build." -ForegroundColor Green
