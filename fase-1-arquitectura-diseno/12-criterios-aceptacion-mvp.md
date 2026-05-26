# Criterios de aceptacion del MVP

Estos criterios describen que debe poder verificarse antes de abrir la beta.

## Cuenta y acceso

- Un usuario puede registrarse con email y contrasena.
- Un usuario puede iniciar sesion y cerrar sesion.
- Un usuario puede recuperar contrasena.
- El sistema bloquea registro de menores de 18 en beta publica.
- El sistema guarda rol inicial: jugador, responsable de club o admin.

## Perfil de jugador

- Un jugador puede crear y editar su perfil deportivo.
- El perfil exige posicion, ubicacion aproximada, modalidad y disponibilidad.
- El jugador puede definir radio de busqueda.
- El jugador puede configurar visibilidad de su perfil.
- Un jugador puede ver sus postulaciones y estado.

## Clubes y responsables

- Un responsable puede solicitar crear o asociarse a un club.
- Un club nuevo queda pendiente de verificacion.
- Un admin puede aprobar o rechazar club.
- Un admin puede aprobar o rechazar responsable.
- Un responsable no verificado no puede publicar busquedas activas.

## Busquedas

- Un responsable verificado puede crear una busqueda en borrador.
- Una busqueda incluye categoria, modalidad, posicion, ubicacion, tipo de oportunidad y descripcion.
- Una busqueda puede pasar a activa solo si el club esta verificado.
- Un jugador puede filtrar busquedas por ubicacion, posicion, modalidad y categoria.
- Una busqueda puede pausarse o cerrarse.

## Postulaciones

- Un jugador puede postular a una busqueda activa.
- El sistema evita postulaciones duplicadas a la misma busqueda.
- El club puede ver candidatos de sus busquedas.
- El club puede cambiar estado de postulacion.
- El jugador puede retirar su postulacion.

## Chat

- El chat se puede iniciar desde una postulacion.
- El chat no se crea automaticamente al postular.
- No se permiten adjuntos durante beta.
- Un usuario puede reportar una conversacion.
- Un usuario puede bloquear una conversacion.

## Admin y moderacion

- Un admin puede ver usuarios.
- Un admin puede suspender usuarios.
- Un admin puede revisar clubes pendientes.
- Un admin puede revisar responsables pendientes.
- Un admin puede revisar reportes.
- Las acciones sensibles quedan registradas en auditoria.

## Datos federativos

- Un admin puede importar clubes desde CSV o carga manual.
- El sistema guarda origen y fecha de importacion.
- Un admin puede asociar un club importado con un club registrado.
- Los datos importados no reemplazan automaticamente datos revisados.

## Notificaciones y eventos

- El jugador recibe aviso cuando un club lo contacta.
- El club recibe aviso cuando llega una postulacion.
- Se registran eventos minimos de producto.

## Seguridad minima

- Las contrasenas se guardan con hash seguro.
- La API exige permisos por rol.
- Los documentos privados usan acceso restringido.
- Hay rate limiting en login y endpoints sensibles.
- Hay backups configurados antes de beta publica.
