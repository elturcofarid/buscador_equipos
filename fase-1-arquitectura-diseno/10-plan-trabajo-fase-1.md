# Plan de trabajo de fase 1

Duracion recomendada: 3 semanas.

## Semana 1 - Arquitectura y alcance tecnico

Objetivo:

- Cerrar decisiones tecnicas principales.
- Confirmar alcance MVP.
- Reducir riesgos de menores, chat y datos federativos.

Actividades:

- Revisar supuestos de fase 1.
- Confirmar tecnologia app/backend/admin.
- Confirmar politica de edad.
- Confirmar reglas de verificacion de clubes.
- Confirmar reglas de chat.
- Definir proveedor de chat recomendado.
- Definir estrategia de datos federativos para Madrid.

Entregables:

- Arquitectura aprobada.
- Decisiones de seguridad aprobadas.
- Lista de integraciones confirmada.

## Semana 2 - UX y contrato funcional

Objetivo:

- Convertir flujos en pantallas y reglas claras.

Actividades:

- Definir pantallas MVP.
- Definir estados de jugador, club, busqueda y postulacion.
- Diseñar wireframes de baja fidelidad.
- Revisar recorrido jugador.
- Revisar recorrido club.
- Revisar recorrido admin.
- Validar textos y permisos principales.

Entregables:

- Mapa de pantallas aprobado.
- Flujos jugador/club/admin aprobados.
- Lista de componentes principales para diseno UI.

## Semana 3 - Preparacion para desarrollo

Objetivo:

- Dejar fase 2 lista para construir.

Actividades:

- Revisar modelo de datos.
- Revisar API inicial.
- Priorizar backlog.
- Dividir primeros sprints.
- Definir entorno de desarrollo.
- Definir estrategia de pruebas.
- Preparar criterios de aceptacion.

Entregables:

- Backlog priorizado.
- Sprint 1 definido.
- Sprint 2 definido.
- Criterios de aceptacion del MVP.
- Riesgos abiertos documentados.

## Criterios de cierre

La fase 1 se puede cerrar si:

- La arquitectura esta aprobada.
- La politica sobre menores esta decidida para beta.
- El flujo de chat esta decidido.
- La estrategia de verificacion de clubes esta decidida.
- La estrategia federativa inicial no bloquea el MVP.
- El modelo de datos cubre los flujos principales.
- La API cubre perfiles, clubes, busquedas, postulaciones y moderacion.
- El backlog de fase 2 esta priorizado.

## Decisiones que ya no bloquean desarrollo

- Edad minima real del MVP: mayores de 18 para beta publica.
- Chat: el club lo inicia desde una postulacion; no se abre automaticamente.
- Adjuntos en chat: fuera de beta.
- Piloto: Comunidad de Madrid.
- Datos federativos: importacion manual/CSV.

## Decisiones que siguen pendientes, pero no bloquean sprint 1

- Nombre provisional.
- Categoria exacta de beta: juvenil mayor de edad, senior amateur o ambas.
- Como se validara un email federativo si no tenemos fuente oficial.
- Si se permitira compartir telefono/email dentro del chat.
- Coste final del proveedor de chat antes de contratar plan productivo.

## Recomendacion de arranque

Para no retrasar fase 2:

- Construir con soporte tecnico para menores.
- Lanzar primera beta publica solo con mayores de 18.
- Verificacion de clubes manual en beta.
- Chat iniciado por el club desde una postulacion y con bloqueo/reporte.
- Sin adjuntos en chat durante beta.
- Datos federativos por carga manual/CSV.
- Stream Chat como proveedor inicial de chat.
- Expo Notifications como proveedor inicial de notificaciones.
