# Riesgos legales y seguridad

Nota: este documento no sustituye asesoramiento legal. Sirve para identificar temas que deben revisarse con un profesional antes del lanzamiento.

## Privacidad y RGPD

La aplicacion tratara datos personales de jugadores, responsables de clubes y posiblemente menores. Es necesario definir:

- Responsable del tratamiento.
- Finalidades del tratamiento.
- Base juridica.
- Politica de privacidad.
- Terminos y condiciones.
- Plazos de conservacion.
- Derechos de acceso, rectificacion, supresion, oposicion y portabilidad.
- Encargados de tratamiento: hosting, chat, analitica, notificaciones, email.

## Menores de edad

Riesgo alto si se permite registro de menores.

Puntos a definir:

- Edad minima de registro.
- Consentimiento de padres o tutores cuando corresponda.
- Visibilidad publica del perfil.
- Contacto directo entre adultos y menores.
- Moderacion de mensajes.
- Restricciones de fotos, videos y datos de ubicacion.
- Canal de denuncia.

Recomendacion para beta:

- Empezar con jugadores mayores de 16 anos o mayores de 18 anos si se quiere reducir riesgo.
- Si se incluyen menores, exigir consentimiento parental y controles especificos.

## Verificacion de clubes

Riesgo:

- Perfiles falsos.
- Personas no autorizadas publicando como club.
- Uso indebido para contactar jugadores.

Medidas:

- Verificacion manual inicial.
- Email de dominio oficial si existe.
- Documento o autorizacion del club.
- Validacion telefonica.
- Registro de responsable.
- Auditoria de cambios.

## Chat y comunicacion

Riesgo:

- Spam.
- Contacto inapropiado.
- Acoso.
- Captacion fraudulenta.
- Solicitud de pagos externos.

Medidas:

- Reportar y bloquear.
- Moderacion reactiva.
- Filtros anti-spam.
- Limites de mensajes para cuentas nuevas.
- Historial auditable.
- Avisos de seguridad.
- Prohibir compartir datos sensibles innecesarios.

## Datos federativos y derechos

Riesgo:

- Uso no autorizado de datos, escudos, logos, fotos o actas.
- Diferencias entre fuentes.
- Datos obsoletos.

Medidas:

- Preferir acuerdos o fuentes con permiso.
- Guardar origen y fecha de actualizacion.
- Permitir correcciones.
- No usar logos si no hay permiso.
- Separar datos propios de datos importados.

## Seguridad tecnica minima

- Autenticacion segura.
- Hash de contrasenas.
- 2FA para administradores.
- Roles y permisos.
- Rate limiting.
- Logs de acciones sensibles.
- Copias de seguridad.
- Cifrado en transito.
- Cifrado de secretos.
- Revision de dependencias.

## Decisiones legales pendientes

- Edad minima para piloto.
- Politica de contacto con menores.
- Nivel de verificacion de clubes.
- Proveedor de chat.
- Ubicacion de servidores y transferencias internacionales.
- Uso de imagenes y videos de jugadores.
- Terminos de responsabilidad sobre pruebas deportivas.
