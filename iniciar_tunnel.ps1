$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$cfPath = ""
if (Test-Path "C:\Program Files (x86)\cloudflared\cloudflared.exe") {
    $cfPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
} elseif (Test-Path "C:\Program Files\cloudflared\cloudflared.exe") {
    $cfPath = "C:\Program Files\cloudflared\cloudflared.exe"
} else {
    $cfCmd = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($cfCmd) { $cfPath = $cfCmd.Source }
}

if (-not $cfPath) {
    Write-Host "ERRO: O cloudflared.exe nao foi encontrado em Program Files!" -ForegroundColor Red
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

$maxTentativas = 3
$tentativa = 1
$linkEncontrado = $null
$logFile = Join-Path $PSScriptRoot "tunnel.log"

while ($tentativa -le $maxTentativas -and -not $linkEncontrado) {
    Clear-Host
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host "              ODONTOPRINT - CRIANDO LINK PUBLICO ONLINE                " -ForegroundColor Cyan
    Write-Host "=======================================================================" -ForegroundColor Cyan
    Write-Host ""
    if ($tentativa -gt 1) {
        Write-Host "Tentativa $tentativa de $maxTentativas..." -ForegroundColor Yellow
    }
    Write-Host "Conectando ao Cloudflare Tunnel (100% Gratuito e Seguro)..." -ForegroundColor Yellow
    Write-Host "Aguarde de 5 a 10 segundos..." -ForegroundColor Gray
    Write-Host ""

    if (Test-Path $logFile) { Remove-Item $logFile -Force -ErrorAction SilentlyContinue }

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $cfPath
    $psi.Arguments = "tunnel --edge-ip-version 4 --url http://localhost:4200"
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $proc = [System.Diagnostics.Process]::Start($psi)
    $timeoutSeconds = 25
    $sw = [System.Diagnostics.Stopwatch]::StartNew()

    while (-not $proc.HasExited -and $sw.Elapsed.TotalSeconds -lt $timeoutSeconds) {
        $line = $proc.StandardError.ReadLine()
        if ($line) {
            Add-Content -Path $logFile -Value $line -ErrorAction SilentlyContinue
            if ($line -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
                $linkEncontrado = $matches[0]
                break
            }
        }
    }

    if (-not $linkEncontrado) {
        if (-not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        $tentativa++
        if ($tentativa -le $maxTentativas) {
            Write-Host "Aguardando 3 segundos para tentar novamente..." -ForegroundColor DarkYellow
            Start-Sleep -Seconds 3
        }
    }
}

if ($linkEncontrado) {
    $txtFile = Join-Path $PSScriptRoot "LINK_PUBLICO.txt"
    Set-Content -Path $txtFile -Value $linkEncontrado -Encoding UTF8

    try {
        Set-Clipboard -Value $linkEncontrado
    } catch {}

    Clear-Host
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host "             ODONTOPRINT - LINK PUBLICO GERADO COM SUCESSO!            " -ForegroundColor Green
    Write-Host "=======================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " SEU LINK DE ACESSO ONLINE:" -ForegroundColor White
    Write-Host " " -NoNewline
    Write-Host "$linkEncontrado" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host ""
    Write-Host " [OK] Link COPIADO para a area de transferencia! Basta colar (Ctrl+V)." -ForegroundColor Green
    Write-Host " [OK] Link tambem salvo no arquivo: LINK_PUBLICO.txt" -ForegroundColor Green
    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Gray
    Write-Host " DICA: Mantenha esta janela aberta para que o link continue funcionando." -ForegroundColor Yellow
    Write-Host " Para desligar o link publico, basta fechar esta janela." -ForegroundColor Gray
    Write-Host "=======================================================================" -ForegroundColor Gray
    Write-Host ""

    while (-not $proc.HasExited) {
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host ""
    Write-Host "=======================================================================" -ForegroundColor Red
    Write-Host " ERRO: Nao foi possivel conectar ao Cloudflare Tunnel." -ForegroundColor Red
    Write-Host "=======================================================================" -ForegroundColor Red
    Write-Host "Verifique sua conexao com a internet e tente novamente." -ForegroundColor Yellow
    Write-Host "Detalhes gravados em: $logFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

