#!/bin/bash

# Travel Agent MVP - Development Setup Script
# This script sets up the development environment and starts all services

echo "🚀 Starting Travel Agent MVP Development Environment"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node > /dev/null 2>&1; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm > /dev/null 2>&1; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start Docker services (PostgreSQL, Redis, Elasticsearch)
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Install dependencies for all packages
echo "📦 Installing dependencies..."
npm install

# Build shared libraries
echo "🔨 Building shared libraries..."
npm run build:libs

# Start all services in development mode
echo "🎯 Starting development servers..."
echo "- Auth Service: http://localhost:3001"
echo "- User Service: http://localhost:3002" 
echo "- Trip Service: http://localhost:3003"
echo "- Web App: http://localhost:3000"
echo ""
echo "📚 API Documentation will be available at:"
echo "- Auth Service: http://localhost:3001/api/docs"
echo "- User Service: http://localhost:3002/api/docs"
echo "- Trip Service: http://localhost:3003/api/docs"
echo ""

# Start development mode
npm run dev