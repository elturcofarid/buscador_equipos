# App movil base

Fecha: 2026-05-26

## Implementado

- Proyecto Expo real en `apps/mobile`.
- Listado de busquedas activas contra la API.
- Login de jugador.
- Guardado automatico de perfil base tras login.
- Seleccion de busqueda.
- Detalle de busqueda.
- Envio de postulacion.
- Registro de jugador desde la app.
- Vista `Mis postulaciones`.
- Estados de postulacion en espanol.
- Retirada de postulacion.
- Export web para verificacion.
- Servidor estatico local para evitar limite de watchers.

## URL local verificada

```text
http://localhost:3007
```

La app consume:

```text
http://localhost:3004/api/v1
```

## Verificacion realizada

- TypeScript de mobile: OK.
- Export web de Expo: OK.
- Carga de busquedas activas: OK.
- Login con jugador de prueba: OK.
- Registro con jugador de prueba: OK.
- Perfil base creado/actualizado tras login: OK.
- Postulacion desde la app: OK.
- Vista `Mis postulaciones`: OK.
- Retirada de postulacion: OK.

## Resultado observado

- La app mostro 1 busqueda activa.
- La sesion paso de `No` a `Activa`.
- El boton de postulacion quedo disponible despues del login.
- La postulacion devolvio confirmacion: `Postulacion enviada`.
- La vista de postulaciones mostro el estado.
- La retirada devolvio confirmacion: `Postulacion retirada`.

## Limitacion local

`expo start --web` no pudo usarse por limite de archivos vigilados (`EMFILE`). Se uso:

```bash
HOME=/private/tmp/bpf-expo-home EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_BASE_URL="http://localhost:3004/api/v1" npm run build -w @bpf/mobile
PORT=3007 npm run serve:web -w @bpf/mobile
```

## Siguiente paso recomendado

- Preparar navegacion mobile real antes de sumar chat.
- Agregar persistencia segura de sesion.
- Agregar edicion de perfil jugador.
