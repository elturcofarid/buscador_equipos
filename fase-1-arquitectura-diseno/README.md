# Fase 1 - Arquitectura y diseno

Fecha de inicio: 2026-05-25

Esta fase convierte el descubrimiento en un plano de producto construible. El objetivo no es programar todavia, sino dejar definidas las bases de arquitectura, experiencia de usuario, datos, integraciones y alcance tecnico para empezar fase 2 sin improvisar.

## Supuestos de trabajo

- Pais inicial: Espana.
- Piloto: Comunidad de Madrid.
- Futbol: masculino y femenino.
- Modalidades contempladas: futbol 11, futbol 7 y futbol sala.
- Categoria inicial indicada: juvenil como referencia de diseno, pero beta publica solo con mayores de 18.
- Edad minima beta publica: 18.
- MVP: debe contemplar tecnicamente jugadores de 16-17, pero el registro de menores queda desactivado hasta cerrar operativa legal y consentimiento.
- Clubes: cualquier usuario puede solicitar crear o asociarse a un club, pero solo usuarios verificados pueden publicar busquedas activas.
- Datos federativos: se disena una capa de integracion flexible; no se asume API publica uniforme.

## Documentos

- `01-supuestos-y-decisiones.md`: decisiones tomadas, interpretaciones y puntos bloqueantes.
- `02-arquitectura-tecnica.md`: arquitectura general del sistema.
- `03-modelo-de-datos.md`: entidades principales y relaciones.
- `04-api-backend.md`: contrato inicial de API.
- `05-ux-y-flujos.md`: mapa de pantallas y recorridos.
- `06-integraciones.md`: chat, notificaciones, datos federativos, storage y analitica.
- `07-seguridad-privacidad-y-menores.md`: reglas tecnicas y operativas.
- `08-backlog-fase-2.md`: epicas y tareas para empezar desarrollo.
- `09-preguntas-abiertas.md`: preguntas que necesitamos cerrar contigo.
- `10-plan-trabajo-fase-1.md`: calendario, entregables y criterios de cierre.
- `11-decisiones-aprobadas.md`: decisiones operativas tomadas para avanzar.
- `12-criterios-aceptacion-mvp.md`: condiciones verificables para considerar completo el MVP.
- `13-wireframes-baja-fidelidad.md`: estructura inicial de pantallas.
- `14-sprint-1-detallado.md`: primer sprint listo para fase 2.
- `15-cierre-fase-1.md`: cierre operativo y paso a desarrollo.

## Resultado esperado

Al cerrar fase 1 deberiamos tener:

- Arquitectura aprobada.
- Modelo de datos base aprobado.
- Flujos UX principales aprobados.
- Proveedor de chat elegido.
- Politica de menores decidida.
- Estrategia inicial de datos federativos definida.
- Backlog de desarrollo listo para fase 2.

## Duracion sugerida

3 semanas.

Puede acortarse si aceptamos las decisiones propuestas y dejamos la parte federativa como importacion manual/semiautomatica para el MVP.
