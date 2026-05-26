# Mobile

App movil Expo del MVP.

## Comandos

```bash
EXPO_PUBLIC_API_BASE_URL="http://localhost:3004/api/v1" npm run web -w @bpf/mobile
```

En esta maquina el servidor dev de Expo puede chocar con el limite de archivos vigilados. Para probar sin watcher:

```bash
HOME=/private/tmp/bpf-expo-home EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_BASE_URL="http://localhost:3004/api/v1" npm run build -w @bpf/mobile
PORT=3007 npm run serve:web -w @bpf/mobile
```

## URL local verificada

```text
http://localhost:3007
```

## Funciones actuales

- Listar busquedas activas.
- Navegacion con barra inferior entre busquedas, postulaciones, club y cuenta.
- Pantalla separada para detalle de busqueda.
- Portal club para crear clubes y ver estado de verificacion.
- Crear borradores de convocatorias desde la app.
- Publicar, pausar y cerrar convocatorias de clubes verificados.
- Ver y actualizar postulaciones recibidas por un club verificado.
- Login de jugador.
- Registro diferenciado como jugador o club.
- Navegacion filtrada por tipo de cuenta.
- Restaurar sesion guardada al volver a abrir la app.
- Crear/actualizar perfil base despues de login.
- Editar perfil deportivo del jugador.
- Seleccionar busqueda.
- Enviar postulacion.
- Ver mis postulaciones.
- Retirar postulaciones.

## Sesion

La app guarda el token con `expo-secure-store` en iOS/Android. En web usa
`localStorage` como fallback de desarrollo.

## Nota para dispositivos fisicos

En un telefono real, `localhost` apunta al propio telefono. Para probar contra la API local desde un dispositivo fisico, usa la IP de tu maquina:

```text
EXPO_PUBLIC_API_BASE_URL="http://TU_IP_LOCAL:3004/api/v1"
```
