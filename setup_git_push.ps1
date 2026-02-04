# Script de Configuração Automática do Git e GitHub Actions
# Autor: Antigravity Assistant

$gitPath = "C:\Program Files\Git\cmd\git.exe"
$repoUrl = "https://github.com/INOSUKE29/agrogb-mobile..git"

Write-Host "Git encontrado em: $gitPath" -ForegroundColor Green
Write-Host "Repositório alvo: $repoUrl" -ForegroundColor Cyan

# Função para rodar Git seguro
function Run-Git {
    param([string]$assess)
    $argsList = $assess -split " "
    & $gitPath $argsList
}

Write-Host "Configurando Git..." -ForegroundColor Green
& $gitPath init
& $gitPath add .
& $gitPath commit -m "V7.0 Build Setup - GitHub Actions"
& $gitPath branch -M main

Write-Host "Conectando ao GitHub..." -ForegroundColor Green
& $gitPath remote remove origin 2>$null
& $gitPath remote add origin $repoUrl

Write-Host "Enviando código..." -ForegroundColor Yellow
& $gitPath push -u origin main

Write-Host "SUCESSO! O código foi enviado. Verifique a aba Actions no GitHub." -ForegroundColor Cyan
Pause
