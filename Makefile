# TrueDom Makefile — Windows (use with `make` via Git Bash, WSL, or GnuWin32)
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -Command

.PHONY: deploy deploy-backend deploy-frontend deploy-db local up down help

## Full deploy: infra + backend + frontend + db migrations
deploy:
	.\scripts\deploy-dev.ps1

## Deploy only backend (build + push + update container app)
deploy-backend:
	.\scripts\deploy-backend.ps1

## Deploy only frontend (build + publish static web app)
deploy-frontend:
	.\scripts\deploy-frontend.ps1

## Run Flyway migrations against Azure PostgreSQL
deploy-db:
	.\scripts\deploy-db.ps1

## GitHub secrets setup
github-secrets:
	.\scripts\azure-github-secrets.ps1

## Start local dev environment (PostgreSQL + backend)
local:
	docker compose up -d db
	cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=local

## Start full local stack with docker compose
up:
	docker compose up -d --build

## Stop local stack
down:
	docker compose down

## Show help
help:
	@echo ""
	@echo "  make deploy           - Full deploy (infra + backend + frontend + db)"
	@echo "  make deploy-backend   - Solo backend"
	@echo "  make deploy-frontend  - Solo frontend"
	@echo "  make deploy-db        - Solo migraciones Flyway"
	@echo "  make github-secrets   - Configurar secretos GitHub Actions"
	@echo "  make local            - Dev local (PostgreSQL Docker + backend)"
	@echo "  make up               - Docker Compose completo"
	@echo "  make down             - Detener Docker Compose"
	@echo ""
