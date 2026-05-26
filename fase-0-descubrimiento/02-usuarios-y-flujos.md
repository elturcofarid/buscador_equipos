# Usuarios y flujos iniciales

## Tipos de usuario

### Jugador

Persona que busca equipo, prueba, cambio de club o mayor visibilidad.

Datos principales:

- Nombre y apellidos.
- Edad o fecha de nacimiento.
- Ubicacion.
- Posicion principal y posiciones secundarias.
- Pierna dominante.
- Altura y peso opcionales.
- Categoria.
- Club actual o ultimo club.
- Disponibilidad.
- Radio de desplazamiento.
- Video, fotos o enlaces opcionales.
- Estado federativo opcional si se puede validar.

### Club

Entidad deportiva que busca jugadores para uno o varios equipos.

Datos principales:

- Nombre del club.
- Ubicacion.
- Federacion territorial.
- Categorias/equipos.
- Persona responsable.
- Canal de contacto validado.
- Estado de verificacion.

### Responsable de club

Entrenador, coordinador, director deportivo o delegado autorizado para publicar busquedas y responder candidatos.

Datos principales:

- Nombre.
- Rol.
- Club asociado.
- Documento o prueba de autorizacion, si aplica.
- Email o telefono corporativo, si existe.

### Administrador interno

Equipo de la plataforma. Revisa usuarios, reportes, clubes, datos federativos e incidencias.

## Flujo jugador - Alta y busqueda

1. Se registra.
2. Elige tipo de cuenta: jugador.
3. Completa perfil deportivo minimo.
4. Define ubicacion y radio de busqueda.
5. Explora oportunidades.
6. Guarda busquedas o clubes.
7. Postula a una publicacion.
8. Recibe respuesta.
9. Conversa por chat o mensaje asincrono.
10. Marca estado: contactado, prueba agendada, descartado o incorporado.

## Flujo club - Alta y publicacion

1. Se registra un responsable.
2. Solicita asociar su cuenta a un club.
3. Completa datos del club.
4. La plataforma revisa o valida el club.
5. Crea una busqueda de jugador.
6. Recibe postulaciones.
7. Filtra candidatos.
8. Inicia conversacion.
9. Actualiza estado de cada candidato.
10. Cierra la busqueda cuando cubre la necesidad.

## Flujo admin - Verificacion y moderacion

1. Revisa nuevas solicitudes de club.
2. Comprueba datos basicos.
3. Aprueba, rechaza o solicita informacion.
4. Revisa reportes de chat o perfiles.
5. Bloquea usuarios si corresponde.
6. Corrige datos federativos o duplicados.

## Flujos que conviene dejar fuera del MVP

- Pagos o suscripciones.
- Contratos deportivos.
- Gestion de licencias federativas.
- Transferencias entre clubes.
- Estadisticas avanzadas automatizadas.
- Ojeadores externos sin club asociado.
- Representantes de jugadores.

Estos flujos pueden ser valiosos, pero aumentan riesgo legal y complejidad antes de validar el nucleo del producto.
