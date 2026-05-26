# Verificacion Docker + API

Fecha: 2026-05-25

## Servicios levantados

```text
PostgreSQL/PostGIS: localhost:5432
Redis: localhost:6379
```

Estado verificado:

- PostgreSQL: healthy.
- Redis: activo.

## Migraciones

Migracion aplicada:

```text
20260525152054_initial_sprint_1
```

Resultado:

```text
Database schema is up to date.
```

## API

Servidor inicial probado en:

```text
http://localhost:3003
```

Servidor actualizado con busquedas y postulaciones:

```text
http://localhost:3004
```

Endpoints verificados:

- `GET /api/v1/health`
- `GET /api/docs`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `PUT /api/v1/players/me`
- `POST /api/v1/clubs`
- `GET /api/v1/admin/clubs/pending`
- `POST /api/v1/admin/clubs/:clubId/approve`

Endpoints agregados en el siguiente bloque:

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

## Prueba funcional

Resultado:

```json
{
  "minorBlocked": true,
  "adminPublicBlocked": true,
  "playerRegistered": true,
  "profileSaved": true,
  "clubCreatedPending": true,
  "adminLogin": true,
  "pendingListWorks": true,
  "clubApproved": true
}
```

## Ajustes realizados durante la verificacion

- Se impidio crear cuentas admin desde el registro publico.
- Se corrigio la lectura del usuario autenticado desde JWT.
- Se evito devolver `passwordHash` en respuestas admin con usuarios relacionados.

## Nota

La API mas reciente quedo probada y actualizada en el puerto `3004`.
