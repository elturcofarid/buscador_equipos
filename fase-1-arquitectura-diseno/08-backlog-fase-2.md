# Backlog para fase 2

Este backlog prepara el inicio de desarrollo. La fase 2 deberia construir backend, base de datos y panel/admin minimo.

## Epica 1 - Fundacion tecnica

- Crear repositorio.
- Definir estructura monorepo o repos separados.
- Configurar backend NestJS.
- Configurar base PostgreSQL.
- Configurar migraciones.
- Configurar Redis.
- Configurar variables de entorno.
- Configurar CI inicial.
- Configurar lint y formato.

## Epica 2 - Identidad y permisos

- Registro.
- Login.
- Recuperacion de contrasena.
- Roles.
- Sesiones/tokens.
- Middleware de autorizacion.
- Auditoria basica.

## Epica 3 - Perfil jugador

- Crear perfil.
- Editar perfil.
- Preferencias de busqueda.
- Privacidad.
- Validacion de edad.
- Soporte estructural para tutor.

## Epica 4 - Clubes y responsables

- Crear club.
- Solicitar asociacion.
- Verificacion manual.
- Roles dentro del club.
- Estados de club.
- Estados de responsable.

## Epica 5 - Equipos y busquedas

- Crear equipo.
- Crear busqueda en borrador.
- Enviar a revision.
- Publicar busqueda.
- Pausar/cerrar busqueda.
- Listar busquedas con filtros.

## Epica 6 - Postulaciones

- Postular a busqueda.
- Ver postulaciones del jugador.
- Ver candidatos del club.
- Cambiar estado de postulacion.
- Evitar duplicados.

## Epica 7 - Mensajeria

- Elegir proveedor.
- Crear conversacion desde postulacion.
- Generar token de chat.
- Reportar conversacion.
- Bloquear usuario.

## Epica 8 - Admin

- Login admin.
- Dashboard basico.
- Aprobar clubes.
- Aprobar responsables.
- Revisar busquedas.
- Revisar reportes.
- Suspender usuarios.

## Epica 9 - Datos federativos

- Crear modelo de fuente federativa.
- Crear importador CSV/manual.
- Crear pantalla admin de importacion.
- Matching manual club importado-club registrado.
- Guardar origen y fecha.

## Epica 10 - Notificaciones y eventos

- Registrar dispositivo.
- Enviar notificacion de postulacion.
- Enviar notificacion de mensaje.
- Guardar preferencias.
- Registrar eventos analiticos minimos.

## Primer sprint recomendado

Duracion: 2 semanas.

Objetivo:

- Proyecto backend funcionando.
- Base de datos con migraciones iniciales.
- Registro/login.
- Roles base.
- Perfil jugador minimo.
- Club minimo.
- Panel admin esqueleto.

## Segundo sprint recomendado

Duracion: 2 semanas.

Objetivo:

- Verificacion de clubes.
- Crear busquedas.
- Listar busquedas.
- Postulaciones.
- Estados iniciales.
