#!/bin/bash

# IPTV Manager - Production Deploy Script
# This script builds and deploys the application to production

set -e  # Exit on any error

echo "🚀 Starting IPTV Manager Production Deploy..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please copy .env.production and configure your production variables."
    exit 1
fi

# Load production environment variables
print_status "Loading production environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images (optional - uncomment if you want to force rebuild)
# print_status "Removing old images..."
# docker rmi iptv-manager-app:latest || true

# Build production images
print_status "Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Services are running!"
else
    print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Show running containers
print_status "Running containers:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
print_status "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

print_success "🎉 Deploy completed successfully!"
print_status "Application is available at: ${NEXTAUTH_URL:-http://localhost}"
print_status "API is available at: ${API_URL:-http://localhost:3001}"
print_status "Database is available at: localhost:3306"

print_warning "Important reminders:"
echo "  - Update your DNS to point to this server"
echo "  - Configure SSL/TLS certificates"
echo "  - Set up monitoring and backups"
echo "  - Review security settings"

print_status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status "To stop: docker-compose -f docker-compose.prod.yml down"