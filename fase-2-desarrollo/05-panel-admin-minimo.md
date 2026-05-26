# Panel admin minimo

Fecha: 2026-05-26

## Implementado

- App web admin con Next.js.
- Login contra la API.
- Persistencia local de sesion admin.
- Listado de clubes pendientes.
- Indicadores simples:
  - clubes pendientes;
  - responsables a revisar;
  - API conectada.
- Accion para aprobar club.
- Accion para rechazar club.
- Actualizacion manual del listado.

## URL local

```text
http://localhost:3006
```

La API usada por el panel:

```text
http://localhost:3004/api/v1
```

## Credenciales locales

```text
admin@buscador-futbol.local
Admin12345!
```

## Verificacion realizada

- Build del panel admin completado correctamente.
- Login admin verificado en navegador.
- Se creo un club pendiente de prueba.
- El panel mostro el club pendiente.
- Se aprobo el club desde la interfaz.
- El contador volvio a cero.
- Swagger/API sigue respondiendo en `3004`.

## Nota tecnica

El servidor de desarrollo de Next en `3005` entro en limite de archivos vigilados (`EMFILE`) en esta maquina. Para evitar ese problema, la verificacion se hizo con build de produccion local en `3006`.

## Siguiente paso recomendado

Crear la base de la app movil:

- Proyecto Expo real en `apps/mobile`.
- Pantalla de login.
- Pantalla de busquedas activas.
- Conexion con la API en `3004`.
