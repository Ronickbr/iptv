# IPTV Manager - Production Deploy Script for Windows
# This script builds and deploys the application to production

Write-Host "🚀 Starting IPTV Manager Production Deploy..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Error ".env.production file not found!"
    Write-Warning "Please copy .env.production and configure your production variables."
    exit 1
}

# Load production environment variables
Write-Status "Loading production environment variables..."
Get-Content ".env.production" | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
    $key, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($key, $value, "Process")
}

# Stop existing containers
Write-Status "Stopping existing containers..."
try {
    docker-compose -f docker-compose.prod.yml down --remove-orphans
} catch {
    Write-Warning "No existing containers to stop"
}

# Build production images
Write-Status "Building production images..."
try {
    docker-compose -f docker-compose.prod.yml build --no-cache
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
} catch {
    Write-Error "Failed to build images: $_"
    exit 1
}

# Start services
Write-Status "Starting production services..."
try {
    docker-compose -f docker-compose.prod.yml up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start services"
    }
} catch {
    Write-Error "Failed to start services: $_"
    exit 1
}

# Wait for services to be ready
Write-Status "Waiting for services to be ready..."
Start-Sleep -Seconds 30

# Check if services are running
Write-Status "Checking service health..."
$runningServices = docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}"
if ($runningServices -match "Up") {
    Write-Success "Services are running!"
} else {
    Write-Error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
}

# Show running containers
Write-Status "Running containers:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
Write-Status "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

Write-Success "🎉 Deploy completed successfully!"

$appUrl = $env:NEXTAUTH_URL
if (-not $appUrl) { $appUrl = "http://localhost" }

$apiUrl = $env:API_URL
if (-not $apiUrl) { $apiUrl = "http://localhost:3001" }

Write-Status "Application is available at: $appUrl"
Write-Status "API is available at: $apiUrl"
Write-Status "Database is available at: localhost:3306"

Write-Warning "Important reminders:"
Write-Host "  - Update your DNS to point to this server" -ForegroundColor Yellow
Write-Host "  - Configure SSL/TLS certificates" -ForegroundColor Yellow
Write-Host "  - Set up monitoring and backups" -ForegroundColor Yellow
Write-Host "  - Review security settings" -ForegroundColor Yellow

Write-Status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
Write-Status "To stop: docker-compose -f docker-compose.prod.yml down"

Write-Host "\n✅ Deploy script completed!" -ForegroundColor Green