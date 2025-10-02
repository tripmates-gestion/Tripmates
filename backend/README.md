# Inicio rápido

Para iniciar el proyecto, se debe tener instalado docker y docker-compose.

Luego, se debe copiar el archivo .env.example a .env y modificar los valores de las variables de entorno.

Finalmente, se debe ejecutar el siguiente comando:

- Si es la primera vez o se realizó algún cambio en las dependencias:

```bash
docker compose up --build -d
```

- Si es la segunda vez o se realizó algún cambio en el código:

```bash
docker compose up -d
```

Para detener el proyecto, se debe ejecutar el siguiente comando:

```bash
docker compose down
```

## Acceso a endpoints protegidos

ACtualmente el proyecto no cuenta con una autenticación unificada. Para acceder a los endpoints protegidos (que por el momento son todos, exceptuando [salud](#salud)), emplear las siguientes credenciales:

- usuario: `user`
- contraseña: se genera automáticamente al iniciar la aplicación y aparece en los logs de la consola con el siguiente mensaje previo: "Using generated security password: <contraseña>"

La URL base del proyecto es [http://localhost:8080](http://localhost:8080), la misma que cambiará (así como las demás URLs empleadas) en caso de:

- cambiar a ambiente de producción
- cambiar el puerto en el que se levanta la API

## Acceso a las componentes mediante el browser

Una vez iniciado el proyecto:

- Se puede acceder a la base de datos local de Neo4j [aquí](http://localhost:7474), indicando las credenciales empleadas al levantar el proyecto, por ejemplo:
  - username: neo4j
  - password: neo-password

- Se puede acceder a la [documentación de la API local en swagger](http://localhost:8080/swagger-ui.html) empleando las mismas credenciales especificadas en [el punto anterior](#acceso-a-endpoints-protegidos).

## Salud

El endpoint de salud se encuentra disponible en la siguiente URL: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health). Muestra:

- El estado general (UP, DOWN)
- El estado de la base de datos
- El estado del disco
- Otros indicadores de salud

## Conexión a las bases de datos

- Para conectar con mongo desde la aplicación usar el puerto `MONGO_PORT`
- Para conectar con neo4j desde la aplicación usar el puerto `NEO4J_BOLT_PORT`
- Para visualizar el contenido de la base de datos desde el browser usar el puerto `NEO4J_BROWSER_PORT`

<!-- ## APOC Plugin

APOC (Awesome Procedures On Cypher) es una biblioteca de procedimientos y funciones para Neo4j que proporciona una amplia gama de funcionalidades, incluyendo:

- Importación/exportación de datos
- Funciones de conversión
- Operaciones de grafos
- Integración con otras bases de datos
- Y muchas utilidades más

Actualmente, el proyecto está configurado sin APOC para garantizar la estabilidad. Si necesitas usar APOC, sigue las instrucciones en la sección de solución de problemas a continuación. -->

<!-- ## Solución de Problemas

### 1. Error al iniciar Neo4j con APOC

Si necesitas usar el plugin APOC y ves errores como `Unrecognized setting` o problemas de configuración:

1. Actualiza la configuración en `backend/compose.yml` para incluir APOC:

   ```yaml
   neo4j:
     image: neo4j:4.4.29-community
     environment:
       NEO4J_PLUGINS: '["apoc"]'
       NEO4J_dbms_security_procedures_unrestricted: apoc.*
   ```

2. Reconstruye los contenedores:

   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

### 2. Problemas de conexión con Neo4j

Si la aplicación no puede conectarse a Neo4j:

1. Verifica que el contenedor de Neo4j esté en ejecución:

   ```bash
   docker ps | grep neo4j
   ```

2. Revisa los logs de Neo4j:

   ```bash
   docker logs tripmates-neo4j
   ```

### 3. Problemas con MongoDB

Si hay problemas con MongoDB:

1. Verifica que el contenedor esté en ejecución:

   ```bash
   docker ps | grep mongo
   ```

2. Revisa los logs:

   ```bash
   docker logs tripmates-mongo
   ```

### 4. Reconstruir todo desde cero

Si los problemas persisten, intenta:

```bash
docker compose down -v
docker system prune -a
docker volume prune
```

Luego inicia los contenedores nuevamente.

### 5. Limpiar caché de Maven

Si hay problemas con las dependencias de Java:

```bash
docker exec -it tripmates-backend mvn clean install
```

### 6. Verificar logs de la aplicación

Para ver los logs de la aplicación en tiempo real:

```bash
docker compose logs -f backend -->
