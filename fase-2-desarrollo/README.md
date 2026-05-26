# Fase 2 - Desarrollo inicial

Esta fase empieza la construccion del MVP a partir de la arquitectura aprobada.

## Decisiones base heredadas

- Beta publica para mayores de 18.
- Comunidad de Madrid.
- Clubes verificados manualmente.
- Chat iniciado por el club desde postulacion.
- Sin adjuntos en chat durante beta.
- Datos federativos por carga manual/CSV.
- Stream Chat para mensajeria.
- Expo Notifications para push.

## Sprint 1

Duracion recomendada: 2 semanas.

Objetivo:

- Crear la base tecnica.
- Implementar identidad.
- Implementar roles.
- Implementar perfil jugador minimo.
- Implementar club minimo.
- Implementar admin esqueleto.

## Estructura tecnica propuesta

```text
apps/
  api/
  admin/
  mobile/
packages/
  config/
  shared/
  database/
docs/
```

## Stack de desarrollo

- Monorepo: pnpm workspaces o Turborepo.
- API: NestJS.
- Admin: Next.js.
- Mobile: Expo.
- DB: PostgreSQL + PostGIS.
- ORM: Prisma.
- Cache/colas: Redis.
- Documentacion API: OpenAPI/Swagger.

## Orden de implementacion

1. Crear monorepo.
2. Crear API NestJS.
3. Configurar Prisma y PostgreSQL.
4. Crear migraciones iniciales.
5. Implementar auth.
6. Implementar roles.
7. Implementar perfil jugador.
8. Implementar clubes.
9. Crear admin minimo.

## Criterios de salida del sprint 1

- El backend arranca localmente.
- Hay endpoint de salud.
- Hay migraciones iniciales.
- Usuario puede registrarse e iniciar sesion.
- Registro de menores de 18 queda bloqueado.
- Jugador puede crear perfil minimo.
- Responsable puede solicitar club.
- Admin puede aprobar/rechazar club.

## Estado actual ampliado

- Seed admin listo.
- Busquedas de jugadores listas.
- Postulaciones listas.
- API actualizada disponible en `http://localhost:3004/api/docs`.
- Panel admin minimo disponible en `http://localhost:3006`.

## Siguiente paso

Preparar la app movil base con login y listado de busquedas.

## Avance realizado

- Monorepo creado.
- API NestJS creada.
- Prisma configurado.
- Esquema inicial de usuarios, perfiles, clubes, miembros y auditoria creado.
- Registro/login implementado.
- Bloqueo de menores de 18 implementado por defecto.
- Perfil jugador minimo implementado.
- Clubes y solicitudes de asociacion implementados.
- Endpoints admin para aprobar/rechazar clubes implementados.
- Docker Compose preparado para PostgreSQL/PostGIS y Redis.
