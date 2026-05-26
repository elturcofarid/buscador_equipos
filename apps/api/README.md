# API

Backend inicial del MVP.

## Comandos

```bash
npm run db:generate
npm run db:seed
npm run build -w @bpf/api
npm run dev:api
```

## Variables

Copiar `apps/api/.env.example` a `apps/api/.env` o definir las variables al ejecutar.

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/buscador_futbol?schema=public"
JWT_SECRET="change-me-in-development"
PORT=3001
ALLOW_MINOR_PLAYERS=false
MIN_PLAYER_AGE=18
ADMIN_EMAIL="admin@buscador-futbol.local"
ADMIN_PASSWORD="Admin12345!"
```

## Endpoints iniciales

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/players/me`
- `PUT /api/v1/players/me`
- `POST /api/v1/clubs`
- `GET /api/v1/clubs/mine`
- `POST /api/v1/clubs/:clubId/join-request`
- `GET /api/v1/opportunities`
- `GET /api/v1/opportunities/:opportunityId`
- `POST /api/v1/opportunities`
- `POST /api/v1/opportunities/:opportunityId/publish`
- `POST /api/v1/opportunities/:opportunityId/pause`
- `POST /api/v1/opportunities/:opportunityId/close`
- `POST /api/v1/opportunities/:opportunityId/applications`
- `GET /api/v1/players/me/applications`
- `GET /api/v1/clubs/:clubId/applications`
- `PUT /api/v1/applications/:applicationId/status`
- `POST /api/v1/applications/:applicationId/withdraw`
- `GET /api/v1/admin/clubs/pending`
- `POST /api/v1/admin/clubs/:clubId/approve`
- `POST /api/v1/admin/clubs/:clubId/reject`

## Documentacion interactiva

Cuando el servidor este activo:

```text
http://localhost:3001/api/docs
```

## Admin local

El seed crea o actualiza un admin local:

```text
admin@buscador-futbol.local
Admin12345!
```

## Panel admin web

```text
http://localhost:3006
```
