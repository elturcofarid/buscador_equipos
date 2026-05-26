# Verificacion oportunidades y postulaciones

Fecha: 2026-05-25

## Implementado

- Seed admin reproducible.
- Modelo `Team`.
- Modelo `Opportunity`.
- Modelo `Application`.
- Endpoints para crear, publicar, pausar y cerrar busquedas.
- Endpoint publico para listar busquedas activas.
- Endpoints para postular, listar postulaciones y cambiar estado.

## Migracion aplicada

```text
apps/api/prisma/migrations/20260525153314_opportunities_applications/migration.sql
```

## API actualizada

```text
http://localhost:3004/api/v1/health
http://localhost:3004/api/docs
```

## Prueba funcional

Resultado:

```json
{
  "adminSeedLogin": true,
  "clubUserRegistered": true,
  "clubCreatedPending": true,
  "clubApproved": true,
  "opportunityDraftCreated": true,
  "opportunityPublished": true,
  "publicSearchFindsOpportunity": true,
  "playerProfileSaved": true,
  "applicationCreated": true,
  "duplicateBlocked": true,
  "clubCanListApplications": true,
  "clubCanUpdateApplicationStatus": true
}
```

## Siguiente paso recomendado

Preparar un panel admin minimo para dejar de usar llamadas API manuales:

- Login admin.
- Listado de clubes pendientes.
- Aprobar/rechazar club.
- Listado de busquedas.
- Listado de postulaciones por club.
