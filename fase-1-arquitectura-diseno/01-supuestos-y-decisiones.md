# Supuestos y decisiones de fase 1

## Decisiones ya recogidas

- Zona piloto: Comunidad de Madrid.
- Futbol masculino y femenino desde el inicio.
- Modalidades: futbol 11, futbol sala y futbol 7.
- Categoria inicial de referencia: juvenil.
- Edad minima beta publica: 18.
- Soporte tecnico futuro: jugadores de 16-17 con consentimiento, desactivado en beta publica.
- Invitacion a jugadores no registrados: no en MVP.
- Jugadores pueden ocultar parte de su perfil: si.
- Jugador puede estar representado por padre, madre o tutor: si.
- Verificacion de responsable de club: email asociado al club/federacion cuando sea posible.

## Interpretaciones necesarias

### Menores

Decision:

- La arquitectura soportara menores desde el inicio.
- La beta publica aceptara solo mayores de 18.
- El producto tendra una configuracion para permitir o bloquear registros de menores.
- Cuando se active 16-17, requerira consentimiento de padre, madre o tutor y restricciones de comunicacion.

### Publicacion por clubes

La decision "cualquiera puede publicar en nombre de un club" se interpreta de forma segura:

- Cualquier usuario puede solicitar asociarse a un club.
- Cualquier usuario puede crear una busqueda en borrador.
- Solo un responsable verificado puede publicar una busqueda activa.

### Entrenadores independientes

Los entrenadores independientes pueden tener cuenta, pero en MVP se recomienda que no publiquen busquedas si no estan asociados a un club verificado.

## Decisiones tecnicas propuestas

- App movil: React Native + Expo + TypeScript.
- Backend: NestJS + TypeScript.
- Admin web: Next.js + TypeScript.
- Base de datos: PostgreSQL + PostGIS.
- Cache y colas: Redis.
- Storage de imagenes/documentos: S3 compatible.
- Chat MVP: Stream Chat, usando paquete compatible con Expo.
- Notificaciones: Expo Notifications inicialmente, entregando a FCM/APNs segun plataforma.
- Analitica: PostHog o Firebase Analytics.
- Infraestructura inicial: AWS o proveedor cloud equivalente.

## Decisiones operativas aprobadas

- Beta publica en Comunidad de Madrid.
- Beta gratuita.
- Registro de menores desactivado en beta publica.
- Chat no se abre automaticamente al postular; el club debe decidir contactar al candidato.
- Adjuntos de chat desactivados en beta.
- Proveedor de chat por defecto: Stream Chat.
- Proveedor de notificaciones por defecto: Expo Notifications.
- Datos federativos por importacion manual/CSV.
- Escudos y logos federativos fuera del MVP salvo permiso claro.
- Verificacion de clubes y responsables manual durante beta.

## Principio de arquitectura

Disenar modularmente, pero desplegar como sistema simple al inicio:

- Un backend principal.
- Una base de datos principal.
- Una app movil.
- Un panel admin.
- Integraciones externas aisladas por adaptadores.

Esto evita complejidad prematura y permite escalar por modulos cuando el uso real lo exija.
