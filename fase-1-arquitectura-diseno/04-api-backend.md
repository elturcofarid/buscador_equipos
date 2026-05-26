# API backend inicial

La API del MVP puede ser REST. GraphQL no es necesario al inicio.

## Convenciones

- Base path: `/api/v1`
- Autenticacion: Bearer token.
- Respuestas JSON.
- Paginacion con `limit` y `cursor`.
- Filtros por query string.
- Errores con codigo, mensaje y detalle opcional.

## Auth

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

## Perfil jugador

```text
GET    /players/me
PUT    /players/me
POST   /players/me/media
DELETE /players/me/media/{mediaId}
GET    /players/search
GET    /players/{playerId}
PUT    /players/me/privacy
```

Regla:

- `GET /players/{playerId}` devuelve campos segun permisos y visibilidad.

## Tutores y consentimiento

```text
POST /players/me/guardian
GET  /players/me/guardian
POST /guardian-consents/verify
POST /guardian-consents/resend
```

Puede quedar inactivo en MVP si se decide lanzar solo para mayores de 18.

## Clubes

```text
POST /clubs
GET  /clubs
GET  /clubs/{clubId}
PUT  /clubs/{clubId}
POST /clubs/{clubId}/join-request
GET  /clubs/{clubId}/members
PUT  /clubs/{clubId}/members/{memberId}
```

Reglas:

- Crear club queda en `pending`.
- Asociarse a club queda en `pending`.
- Solo miembros verificados pueden publicar busquedas activas.

## Equipos

```text
POST /clubs/{clubId}/teams
GET  /clubs/{clubId}/teams
GET  /teams/{teamId}
PUT  /teams/{teamId}
```

## Busquedas de jugadores

```text
POST /opportunities
GET  /opportunities
GET  /opportunities/{opportunityId}
PUT  /opportunities/{opportunityId}
POST /opportunities/{opportunityId}/submit-for-review
POST /opportunities/{opportunityId}/publish
POST /opportunities/{opportunityId}/pause
POST /opportunities/{opportunityId}/close
```

Filtros:

```text
GET /opportunities?position=keeper&category=juvenil&gender=male&modality=football_11&lat=...&lng=...&radiusKm=30
```

## Postulaciones

```text
POST /opportunities/{opportunityId}/applications
GET  /players/me/applications
GET  /clubs/{clubId}/applications
GET  /applications/{applicationId}
PUT  /applications/{applicationId}/status
POST /applications/{applicationId}/withdraw
```

Reglas:

- Un jugador no puede postular dos veces a la misma busqueda activa.
- Si es menor y no hay consentimiento valido, la postulacion no abre chat.

## Mensajeria

```text
POST /applications/{applicationId}/conversation
GET  /conversations
GET  /conversations/{conversationId}
POST /conversations/{conversationId}/block
POST /conversations/{conversationId}/report
```

Si se usa proveedor externo de chat, la API propia genera tokens, permisos y enlaces con la aplicacion.

## Reportes y moderacion

```text
POST /reports
GET  /reports/me
```

Admin:

```text
GET  /admin/reports
PUT  /admin/reports/{reportId}
GET  /admin/users
PUT  /admin/users/{userId}/status
GET  /admin/clubs/pending
POST /admin/clubs/{clubId}/approve
POST /admin/clubs/{clubId}/reject
GET  /admin/opportunities/pending
POST /admin/opportunities/{opportunityId}/approve
POST /admin/opportunities/{opportunityId}/reject
```

## Datos federativos

```text
POST /admin/federation/imports
GET  /admin/federation/imports
GET  /admin/federation/clubs
POST /admin/federation/clubs/{federationClubId}/match
POST /admin/federation/clubs/{federationClubId}/ignore
GET  /federation/clubs/{clubId}
```

## Notificaciones

```text
POST /devices
DELETE /devices/{deviceId}
GET  /notifications
PUT  /notifications/{notificationId}/read
PUT  /notification-preferences
```

## Eventos analiticos minimos

- user_registered
- player_profile_completed
- club_created
- club_verified
- opportunity_created
- opportunity_published
- application_submitted
- application_viewed
- conversation_started
- report_created
