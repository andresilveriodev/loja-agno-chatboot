# Instala chromadb no venv do ai-service (para o RAG).
# Execute na pasta services/ai-service: .\install_chromadb.ps1
$pip = Join-Path $PSScriptRoot ".venv\Scripts\pip.exe"
if (-not (Test-Path $pip)) {
    Write-Host "Venv nao encontrado. Crie com: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}
& $pip install "chromadb>=1.0.13"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Chromadb instalado. Rode: python -m knowledge.load_products_rag" -ForegroundColor Green
}
