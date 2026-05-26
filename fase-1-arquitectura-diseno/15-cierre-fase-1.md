# Cierre de fase 1

## Estado

Fase 1 lista para pasar a desarrollo inicial.

## Decisiones cerradas

- Piloto: Comunidad de Madrid.
- Beta publica: mayores de 18.
- Soporte futuro para 16-17: si, desactivado por configuracion.
- Clubes: verificacion manual durante beta.
- Chat: iniciado por club desde una postulacion, no automatico.
- Adjuntos en chat: fuera de beta.
- Datos federativos: carga manual/CSV.
- Logos/escudos: fuera del MVP salvo permiso.
- Chat: Stream Chat.
- Push: Expo Notifications.
- Base tecnica: React Native + Expo, NestJS, Next.js, PostgreSQL + PostGIS, Redis.

## Riesgos no bloqueantes

- Coste final de Stream Chat antes de produccion.
- Disponibilidad de una fuente CSV inicial de clubes de Madrid.
- Politica futura para jugadores de 16-17.
- Reglas sobre compartir telefono/email en chat.
- Nombre definitivo de la app.

## Entrada a fase 2

La fase 2 debe empezar por la base tecnica, no por pantallas finales:

1. Crear monorepo.
2. Crear backend base.
3. Crear base de datos y migraciones.
4. Implementar registro/login.
5. Implementar roles.
6. Implementar perfil jugador minimo.
7. Implementar club minimo y verificacion manual.
8. Crear admin esqueleto.

## Criterio para primer avance visible

El primer hito visible sera:

- API funcionando localmente.
- Registro/login operativo.
- Panel admin basico.
- Un club puede quedar pendiente y aprobarse.
- Un jugador puede crear perfil minimo.

Esto todavia no sera la app movil completa, pero sera la columna vertebral del producto.
