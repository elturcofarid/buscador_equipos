# Buscador de pruebas futbol

Aplicacion movil para conectar clubes de futbol con jugadores que buscan equipo, pruebas u oportunidades deportivas.

## Estado actual

- Fase 0: descubrimiento inicial.
- Fase 1: arquitectura y diseno cerrados para MVP.
- Fase 2: desarrollo inicial en marcha.

## Decisiones MVP

- Piloto: Comunidad de Madrid.
- Beta publica: mayores de 18.
- Soporte futuro para 16-17 desactivado por configuracion.
- Clubes verificados manualmente.
- Chat iniciado por el club desde una postulacion.
- Sin adjuntos en chat durante beta.
- Datos federativos por carga manual/CSV.

## Estructura

```text
apps/
  api/      Backend NestJS
  admin/    Panel administrativo
  mobile/   App movil Expo
packages/
  shared/   Tipos y constantes compartidas
```

## Primer hito tecnico

- API funcionando localmente.
- Registro/login.
- Perfil jugador minimo.
- Clubes pendientes de verificacion.
- Aprobacion manual de clubes desde admin API.

## URLs locales actuales

- API: `http://localhost:3004/api/docs`
- Panel admin: `http://localhost:3006`
- App movil web: `http://localhost:3007`
