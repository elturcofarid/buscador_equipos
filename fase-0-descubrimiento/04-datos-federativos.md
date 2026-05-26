# Datos federativos

## Objetivo

Usar datos oficiales o cercanos a oficiales para aumentar confianza, mejorar busqueda y enriquecer perfiles de clubes y competiciones.

## Fuentes potenciales

- RFEF.
- Federaciones territoriales.
- Marcadores y clasificaciones oficiales.
- Fenix, si existe convenio o acceso autorizado.
- Cargas manuales/CSV facilitadas por clubes o federaciones.
- Fuentes publicas con permiso de uso.

## Datos deseables

### Club

- Nombre oficial.
- Escudo, si se cuenta con permiso.
- Federacion territorial.
- Sede/localidad.
- Categorias/equipos inscritos.
- Contactos publicos oficiales.
- Web oficial.

### Competicion

- Nombre.
- Temporada.
- Categoria.
- Grupo.
- Calendario.
- Resultados.
- Clasificacion.

### Equipo

- Club asociado.
- Categoria.
- Grupo.
- Posicion en tabla.
- Ultimos resultados.

## Estrategia tecnica

Crear una capa de integracion independiente:

```text
Federation Data Adapter
        |
Conectores por fuente
        |
Normalizacion
        |
Base interna
        |
API de consulta para app y admin
```

## Estrategia por fases

### Fase piloto

- Elegir 1 comunidad autonoma o 1 conjunto de competiciones.
- Construir un importador manual/CSV.
- Asociar clubes registrados con clubes del catalogo.
- Revisar datos desde admin antes de publicarlos.

### Fase crecimiento

- Agregar conectores por federacion.
- Programar actualizaciones periodicas.
- Registrar historial de cambios.
- Resolver duplicados.

### Fase avanzada

- Acuerdos formales con federaciones.
- Sincronizacion automatica.
- Validacion federativa de clubes.
- Datos deportivos enriquecidos.

## Riesgos

- No hay garantia de API publica uniforme.
- Cada federacion puede tener estructura distinta.
- Scraping puede incumplir condiciones de uso.
- Logos, fotos y actas pueden tener derechos de uso.
- Los datos pueden cambiar durante la temporada.
- La identidad de un responsable de club no se deduce solo del nombre del club.

## Recomendacion

No depender de la integracion federativa para lanzar el MVP. Usarla como capa de confianza progresiva.

La primera version debe permitir:

- Alta manual de club.
- Verificacion interna.
- Vinculacion posterior con datos federativos.
- Correccion de errores desde panel admin.
