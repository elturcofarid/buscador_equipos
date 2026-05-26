# Seguridad, privacidad y menores

## Principios

- La confianza es parte central del producto.
- Un club no verificado no puede publicar busquedas activas.
- Un responsable no verificado no puede contactar jugadores.
- Los jugadores controlan visibilidad de datos sensibles.
- El contacto con menores requiere reglas especificas.

## Roles

- player
- club_member
- club_admin
- independent_coach
- guardian
- platform_admin
- platform_moderator

## Permisos clave

Jugador:

- Editar su perfil.
- Controlar visibilidad.
- Postular.
- Retirar postulacion.
- Reportar o bloquear.

Responsable verificado:

- Crear busquedas.
- Ver postulaciones de su club.
- Cambiar estado de postulacion.
- Iniciar conversacion cuando las reglas lo permitan.

Admin:

- Aprobar clubes.
- Aprobar responsables.
- Suspender usuarios.
- Revisar reportes.
- Gestionar datos federativos.

## Menores

### Configuracion propuesta

Feature flag:

```text
ALLOW_MINOR_PLAYERS=false
MIN_PLAYER_AGE=18
```

Si se activa beta juvenil desde 16 mas adelante:

```text
ALLOW_MINOR_PLAYERS=true
MIN_PLAYER_AGE=16
REQUIRE_GUARDIAN_CONSENT=true
RESTRICT_MINOR_CHAT=true
```

### Reglas para menores si se activan

- Consentimiento de padre, madre o tutor.
- Visibilidad limitada por defecto.
- Ubicacion aproximada, no direccion exacta.
- Chat condicionado a postulacion y contacto iniciado por club verificado.
- Reportes visibles para moderacion prioritaria.
- Sin adjuntos libres en chat al inicio.
- Registro de auditoria en interacciones sensibles.

## Privacidad de perfil

Niveles:

- Publico limitado: visible en busquedas, sin datos sensibles.
- Solo clubes verificados: visible para clubes aprobados.
- Oculto: visible solo al postular.

Campos sensibles:

- Fecha exacta de nacimiento.
- Telefono.
- Email.
- Ubicacion precisa.
- Documentos.
- Datos de tutor.

## Verificacion de clubes

Metodos:

- Email asociado al club.
- Email asociado a federacion si existe.
- Documento del club.
- Verificacion manual.
- Llamada telefonica.

Estados:

- unverified
- pending
- verified
- rejected
- revoked

## Moderacion

MVP:

- Reporte manual.
- Bloqueo.
- Suspension de cuenta.
- Revision admin.
- Rate limits.

Posterior:

- Moderacion automatica de texto.
- Deteccion de patrones de spam.
- Escaneo de adjuntos.

## Auditoria

Acciones que deben registrarse:

- Aprobacion/rechazo de club.
- Aprobacion/rechazo de responsable.
- Cambio de estado de publicacion.
- Suspension de usuario.
- Reportes.
- Acceso admin a datos sensibles.
- Cambios en consentimiento de tutor.
