# Avance sprint 1

Fecha: 2026-05-25

## Completado

- Monorepo creado con workspaces.
- Backend `apps/api` creado con NestJS.
- Prisma configurado con PostgreSQL.
- Esquema inicial validado:
  - usuarios;
  - perfiles de jugador;
  - clubes;
  - miembros de club;
  - auditoria.
- Registro/login implementado.
- Bloqueo de menores de 18 implementado por defecto.
- Perfil jugador minimo implementado.
- Club minimo implementado.
- Solicitud de asociacion a club implementada.
- Admin API para aprobar/rechazar clubes implementada.
- Docker Compose preparado para PostgreSQL/PostGIS y Redis.
- Seed admin reproducible implementado.
- Busquedas de jugadores implementadas.
- Postulaciones implementadas.

## Verificacion realizada

- Dependencias instaladas.
- Prisma Client generado.
- Esquema Prisma validado.
- Build general ejecutado correctamente.
- PostgreSQL/PostGIS y Redis levantados con Docker Compose.
- Migracion inicial aplicada correctamente.
- API arrancada contra PostgreSQL real.
- Health check verificado.
- Swagger verificado.
- Flujo funcional probado:
  - bloqueo de menor de 18;
  - bloqueo de registro admin publico;
  - registro de jugador adulto;
  - guardado de perfil jugador;
  - creacion de club pendiente;
  - login admin;
  - listado admin de clubes pendientes;
  - aprobacion admin de club.
- Flujo de oportunidades probado:
  - login con admin seed;
  - responsable de club registrado;
  - club aprobado;
  - busqueda creada en borrador;
  - busqueda publicada;
  - busqueda visible en listado publico;
  - jugador postula;
  - duplicado de postulacion bloqueado;
  - club lista postulaciones;
  - club cambia estado de postulacion.

## Estado de base de datos

La migracion inicial quedo creada y aplicada:

```text
apps/api/prisma/migrations/20260525152054_initial_sprint_1/migration.sql
```

El estado de migraciones indica que la base esta actualizada.

## API local actualizada

```text
http://localhost:3004/api/v1/health
http://localhost:3004/api/docs
```

## Siguiente bloque de trabajo

- Preparar admin web minimo.
- Preparar app movil base.
- Implementar pantalla de login y consumo de API.
- Implementar vista inicial de busquedas.
