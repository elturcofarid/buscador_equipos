# App movil base

Fecha: 2026-05-26

## Implementado

- Proyecto Expo real en `apps/mobile`.
- Listado de busquedas activas contra la API.
- Navegacion con barra inferior entre busquedas, postulaciones, club y cuenta.
- Pantalla separada para detalle de busqueda y postulacion.
- Portal club para crear clubes, preparar convocatorias y gestionar candidatos.
- Login de jugador.
- Registro diferenciado como jugador o club.
- Restriccion de navegacion por tipo de cuenta.
- Guardado automatico de perfil base tras login.
- Seleccion de busqueda.
- Detalle de busqueda.
- Envio de postulacion.
- Registro de jugador desde la app.
- Vista `Mis postulaciones`.
- Estados de postulacion en espanol.
- Retirada de postulacion.
- Persistencia de sesion con almacenamiento seguro en mobile.
- Restauracion de sesion al abrir la app.
- Edicion de perfil deportivo del jugador.
- Creacion de clubes desde app movil.
- Listado de clubes propios y estado de verificacion.
- Creacion de borradores de convocatorias.
- Publicacion, pausa y cierre de convocatorias para clubes verificados.
- Gestion de estados de postulaciones recibidas.
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
- TypeScript tras persistencia/perfil: OK.
- Export web tras persistencia/perfil: OK.
- Registro con sesion guardada: OK.
- Edicion de perfil deportivo: OK.
- Restauracion de sesion tras recarga: OK.
- Cierre de sesion y limpieza de sesion guardada: OK.
- Navegacion mobile entre busquedas, detalle, postulaciones y cuenta: OK.
- Build API tras portal club: OK.
- TypeScript mobile tras portal club: OK.
- Flujo API club pendiente con borrador de convocatoria: OK.
- Flujo navegador de portal club: OK.
- Bloqueo API para evitar cuenta mixta jugador/club: OK.
- Navegacion mobile filtrada por rol jugador/club: OK.

## Resultado observado

- La app mostro 1 busqueda activa.
- La sesion paso de `No` a `Activa`.
- El boton de postulacion quedo disponible despues del login.
- La postulacion devolvio confirmacion: `Postulacion enviada`.
- La vista de postulaciones mostro el estado.
- La retirada devolvio confirmacion: `Postulacion retirada`.
- Tras guardar el perfil, la app mostro confirmacion: `Perfil guardado`.
- Tras recargar, la app mostro: `Sesion restaurada`.
- Tras cerrar sesion y recargar, la sesion volvio a `No`.
- La lista de busquedas abrio una pantalla de detalle separada.
- La barra inferior permitio cambiar entre `Buscar`, `Postulaciones`, `Club` y `Cuenta`.
- El backend permite preparar borradores de convocatorias con club pendiente.
- La publicacion y gestion de postulaciones siguen limitadas a clubes verificados.
- Desde la app se creo un club pendiente y una convocatoria en estado `Borrador`.
- Una cuenta jugador no puede crear clubes ni ver portal club.
- Una cuenta club no puede guardar perfil de jugador ni ver postulaciones de jugador.

## Limitacion local

`expo start --web` no pudo usarse por limite de archivos vigilados (`EMFILE`). Se uso:

```bash
HOME=/private/tmp/bpf-expo-home EXPO_NO_TELEMETRY=1 EXPO_PUBLIC_API_BASE_URL="http://localhost:3004/api/v1" npm run build -w @bpf/mobile
PORT=3007 npm run serve:web -w @bpf/mobile
```

## Siguiente paso recomendado

- Sumar chat asincrono entre jugador y club.
