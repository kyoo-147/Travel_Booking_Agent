@echo off
REM Travel Agent MVP - Development Setup Script for Windows
REM This script sets up the development environment and starts all services

echo 🚀 Starting Travel Agent MVP Development Environment
echo ==================================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm and try again.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Start Docker services (PostgreSQL, Redis, Elasticsearch)
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Install dependencies for all packages
echo 📦 Installing dependencies...
npm install

REM Build shared libraries
echo 🔨 Building shared libraries...
npm run build:libs

REM Start all services in development mode
echo 🎯 Starting development servers...
echo - Auth Service: http://localhost:3001
echo - User Service: http://localhost:3002
echo - Trip Service: http://localhost:3003
echo - Web App: http://localhost:3000
echo.
echo 📚 API Documentation will be available at:
echo - Auth Service: http://localhost:3001/api/docs
echo - User Service: http://localhost:3002/api/docs
echo - Trip Service: http://localhost:3003/api/docs
echo.

REM Start development mode
npm run dev