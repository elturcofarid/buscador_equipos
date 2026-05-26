# Sprint 1 detallado

Duracion recomendada: 2 semanas.

## Objetivo

Dejar funcionando la base tecnica del producto:

- backend inicial;
- base de datos;
- autenticacion;
- roles;
- perfil jugador minimo;
- club minimo;
- admin esqueleto.

## Entregables

- Proyecto backend creado.
- Base PostgreSQL conectada.
- Migraciones iniciales.
- Registro/login.
- Roles base.
- Perfil de jugador minimo.
- Club minimo.
- Solicitud de asociacion a club.
- Admin esqueleto con login.

## Historias de usuario

### S1-01 - Crear base backend

Como equipo tecnico, quiero una base backend mantenible para construir el MVP.

Criterios:

- El servidor arranca en local.
- Hay configuracion por entorno.
- Hay estructura modular.
- Hay endpoint de salud.

### S1-02 - Crear base de datos y migraciones

Como equipo tecnico, quiero versionar la estructura de datos.

Criterios:

- La app conecta a PostgreSQL.
- Existen migraciones para users, player_profiles, clubs y club_members.
- Se puede ejecutar migracion y rollback.

### S1-03 - Registro y login

Como usuario, quiero crear cuenta e iniciar sesion.

Criterios:

- Registro con email, contrasena y nombre.
- Login devuelve token.
- Contrasena se guarda con hash.
- No se permite registro menor de 18 en beta.

### S1-04 - Roles

Como plataforma, quiero distinguir permisos por tipo de usuario.

Criterios:

- Roles iniciales: player, club_member, admin.
- Endpoints protegidos por token.
- Admin tiene rutas separadas.

### S1-05 - Perfil jugador minimo

Como jugador, quiero completar mi perfil deportivo basico.

Criterios:

- Crear/editar posicion, modalidad, ubicacion aproximada y disponibilidad.
- Configurar radio de busqueda.
- Configurar visibilidad.

### S1-06 - Club minimo

Como responsable, quiero solicitar crear o asociarme a un club.

Criterios:

- Crear club queda pendiente.
- Asociacion a club queda pendiente.
- No se puede publicar busqueda si el club no esta verificado.

### S1-07 - Admin esqueleto

Como administrador, quiero revisar solicitudes basicas.

Criterios:

- Admin puede iniciar sesion.
- Admin ve clubes pendientes.
- Admin puede aprobar o rechazar club.

## Fuera del sprint 1

- App movil completa.
- Chat.
- Notificaciones push.
- Busquedas completas.
- Postulaciones.
- Importacion federativa.
- Diseno visual final.

## Riesgos del sprint

- Decidir monorepo antes de crear proyectos.
- Elegir ORM/migraciones.
- Aclarar si admin web arranca en sprint 1 o solo backend admin API.

## Recomendacion tecnica para sprint 1

- Monorepo con apps: `api`, `admin`, `mobile`.
- ORM: Prisma o TypeORM. Recomendacion: Prisma por velocidad de desarrollo y migraciones claras.
- API REST documentada con OpenAPI/Swagger.
- Tests iniciales: unitarios para auth y e2e basico para registro/login.
- Dejar variables preparadas para Stream Chat y Expo Notifications, aunque se integren en sprints posteriores.
