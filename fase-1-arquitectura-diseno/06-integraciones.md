# Integraciones

## Datos federativos

### Objetivo

Enriquecer clubes, equipos y competiciones sin depender de una integracion unica para lanzar.

### Estrategia MVP

- Carga manual o CSV para Madrid.
- Registro del origen de cada dato.
- Matching manual entre club registrado y club importado.
- Revision antes de publicar datos importados.
- Sin uso de escudos/logos si no hay permiso claro.

### Adaptadores previstos

```text
manual-import
csv-import
official-api
public-web-source
```

### Datos minimos recomendados

- Nombre oficial del club.
- Localidad.
- Federacion territorial.
- Categoria/equipo.
- Modalidad.
- Temporada.

### Datos que pueden esperar

- Clasificaciones.
- Resultados.
- Calendario.
- Actas.
- Plantillas federativas.

## Chat

Opciones:

- Stream Chat: rapido, buen SDK movil, moderacion y escalabilidad.
- Firebase: flexible y conocido, pero requiere mas desarrollo propio para reglas y experiencia.
- Chat propio: mayor control, mas tiempo y riesgo.

Recomendacion para MVP:

- Usar Stream Chat como proveedor externo inicial.
- Encapsularlo detras de un modulo `messaging`.
- Guardar en nuestra base solo metadatos, estados, reportes y enlaces con postulaciones.
- Usar el paquete de Stream compatible con Expo.

Reglas iniciales:

- Chat no se crea automaticamente al postular.
- Chat se crea cuando el club decide contactar a un jugador desde una postulacion.
- Si se activan menores en el futuro, el chat puede requerir aprobacion o reglas adicionales.
- Reportar y bloquear desde el primer dia.
- Adjuntos desactivados al inicio o limitados a imagen/documento revisable.

Referencias tecnicas:

- Stream Chat React Native: https://getstream.io/chat/docs/sdk/react-native/
- Stream incluye paquete especifico para Expo: `stream-chat-expo`.

## Notificaciones

Propuesta:

- Expo Notifications para MVP.
- Entrega a FCM/APNs segun plataforma.
- Guardar tokens de dispositivo por usuario.

Eventos:

- Nueva postulacion.
- Postulacion vista.
- Club responde.
- Nuevo mensaje.
- Busqueda aprobada.
- Club verificado.

Referencia tecnica:

- Expo push notifications: https://docs.expo.dev/guides/using-push-notifications-services/

## Email

Usos:

- Verificacion de cuenta.
- Recuperacion de contrasena.
- Invitaciones internas de club.
- Avisos legales importantes.

Opciones:

- Resend.
- SendGrid.
- AWS SES.

## Storage

Usos:

- Fotos.
- Documentos de verificacion.
- Imagenes de club.

Recomendacion:

- S3 compatible.
- URLs firmadas para documentos privados.
- Escaneo basico de archivos.

## Analitica

Eventos minimos:

- Registro.
- Perfil completado.
- Busqueda creada.
- Busqueda publicada.
- Postulacion enviada.
- Conversacion iniciada.
- Reporte creado.

Opciones:

- PostHog.
- Firebase Analytics.

Recomendacion:

- PostHog si queremos control de eventos y embudos de producto.
- Firebase Analytics si priorizamos simplicidad en app movil.
