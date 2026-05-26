# Decisiones aprobadas para avanzar

Este documento fija las decisiones de trabajo para evitar ambiguedad al pasar a desarrollo.

## Producto

- Piloto: Comunidad de Madrid.
- Beta publica: gratuita.
- Usuarios principales: jugadores y responsables de club.
- Futbol: masculino y femenino.
- Modalidades contempladas: futbol 11, futbol 7 y futbol sala.
- Categoria de referencia: juvenil, con revision para incluir senior amateur si conviene por edad.

## Edad y menores

- Edad minima de beta publica: 18.
- La arquitectura incluira soporte para jugadores de 16-17.
- El registro de menores estara desactivado por configuracion.
- Antes de activar 16-17 se requerira:
  - consentimiento de padre, madre o tutor;
  - reglas de visibilidad limitadas;
  - restricciones de chat;
  - revision legal especifica.

## Clubes

- Cualquier usuario puede solicitar asociarse a un club.
- Cualquier usuario puede proponer un club si no existe.
- Solo responsables verificados pueden publicar busquedas activas.
- La verificacion sera manual durante beta.
- Si hay email oficial o federativo, se usara como evidencia, pero no sera el unico metodo.

## Busquedas

- Las busquedas pueden crearse como borrador.
- Para publicarse deben pasar validacion de permisos.
- En beta, las busquedas de clubes no verificados no seran visibles publicamente.

## Chat

- El chat no se abre automaticamente cuando el jugador postula.
- El club puede iniciar contacto desde una postulacion recibida.
- El jugador siempre puede reportar o bloquear.
- Sin adjuntos durante beta.
- Compartir telefono/email queda pendiente de politica de moderacion.
- Proveedor inicial: Stream Chat.

## Datos federativos

- No se dependera de una API oficial para el MVP.
- La carga inicial sera manual o CSV.
- Se guardara origen y fecha de cada dato importado.
- Escudos/logos quedan fuera del MVP salvo permiso claro.
- La informacion federativa se usara como capa de confianza, no como requisito de uso.

## Tecnologia

- App movil: React Native + Expo + TypeScript.
- Backend: NestJS + TypeScript.
- Admin web: Next.js + TypeScript.
- Base de datos: PostgreSQL + PostGIS.
- Cache/colas: Redis.
- Storage: S3 compatible.
- Chat: Stream Chat encapsulado por modulo propio.
- Notificaciones: Expo Notifications.
