# Tripmates

<p align="center">
    <img src="docs/assets/6-pinguinos.png" alt="Logo de Tripmates" width="300">
    <br>
    <em>Conecta. Planifica. Viaja.</em>
</p>

<p align="center">
  <a href="#visión-del-proyecto">Visión</a> •
  <a href="#funcionalidades-principales">Funcionalidades</a> •
  <a href="#nuestro-equipo">Equipo</a> •
  <a href="#zona-de-desarrolladores">Zona Devs</a>
</p>

---

Bienvenido/a a **Tripmates**.

**Tripmates** es el proyecto de nuestro equipo para la materia Gestión del Desarrollo de Sistemas Informáticos (75.46) - FIUBA, Cátedra Fontela, 2C 2025. Se nos propuso como reto el desarrollar la idea de plataforma que responda a una necesidad real de usuarios, finalmente nuestro equipo con mucho empeño y corazón creó una plataforma social diseñada para transformar la experiencia de viajar. 

No somos una agencia de viajes ni un motor de reservas; somos el puente entre viajeros que comparten un mismo estilo y las experiencias locales que realmente valen la pena.

## Visión del Proyecto

Muchos viajeros, especialmente estudiantes y mochileros, se enfrentan al mismo problema: **viajar a ciegas**. Existe mucha información online, pero poca conexión humana. Las reseñas anónimas son frías y a menudo irrelevantes para quien busca una experiencia acorde a su estilo de viaje.

**La solución:** Tripmates ofrece **conexión real**.

Ayudamos a los usuarios a encontrar viajeros con sus mismas prioridades, compartir tips honestos y organizar planes colaborativos antes de siquiera armar la valija. Buscamos que cada viaje empiece con comunidad, claridad y compañía.

## Funcionalidades Principales

La plataforma ofrece dos grandes experiencias según el tipo de usuario:

### Para el Viajero
* **Conexión Social:** Un sistema social para seguir a personas con intereses afines (relación recíproca).
* **Planes Colaborativos:** Creación de listas de viaje compartidas donde varios usuarios pueden agregar alojamientos y restaurantes.
* **Búsqueda Inteligente:** Encuentra negocios y otros viajeros por cercanía o afinidad.
* **Reseñas con Identidad:** Opiniones basadas en perfiles reales, no en usuarios anónimos.

### Para Negocios (Hoteles y Restaurantes)
* **Catálogo Digital:** Gestión de **Menús** (platos con precios/fotos) y **Roompacks** (habitaciones con capacidad y fechas).
* **Publicaciones y Eventos:** Anuncios de promociones temporales o eventos especiales para atraer viajeros.
* **Gamificación (Logros):** Los "me gusta" y buenas reseñas desbloquean medallas que mejoran la reputación del negocio.
* **Métricas en Tiempo Real:** Tablero para visualizar el rendimiento (interacciones, alcance) por semana o mes.

## Nuestro Equipo

- [Leticia Figueroa](https://github.com/leticiafrR)
- [Anibal Fu](https://github.com/anibalfu)
- [Francisco Infanti](https://github.com/FranInfanti)
- [Giuliana Pazos](https://github.com/giulianapazos)
- [Andrea Figueroa](https://github.com/AndreaFigueroaR)
- [Weng Xu Marcos Tomás](https://github.com/wxmarcos)

---

## Zona de Desarrolladores

Esta sección está dedicada a entender la arquitectura, el despliegue y la estructura técnica de Tripmates.

> **Nota para el desarrollador:** A continuación se detallan los pasos necesarios para levantar el entorno de desarrollo y comprender las decisiones de diseño.

### 1. Stack Tecnológico
* **Frontend:** React + TypeScript + MUI
* **Backend:** Spring Boot + Java
* **Base de Datos:** Neo4j + MongoDB
* **Infraestructura:** Docker + Docker Compose

### 2. Arquitectura del Sistema

Tripmates utiliza una arquitectura basada en contenedores, orquestada mediante Docker Compose. El sistema se divide en tres componentes fundamentales:

*   **Frontend**: Aplicación desarrollada en **React** (Vite), que sirve como interfaz de usuario dinámica y responsiva.
*   **Backend**: API REST construida con **Spring Boot** (Java), encargada de la lógica de negocio, seguridad y orquestación de datos.
*   **Persistencia Políglota (Bases de Datos)**:
    *   **MongoDB**: Utilizamos Mongo para almacenar documentos con estructuras variables y contenido rico, como los perfiles de usuario (`Account`), planes de viaje, detalles de negocios y reseñas.
        *   *Referencia*: `com.tripmates.backend.users.entity.mongo.Account`
    *   **Neo4j**: Base de datos orientada a grafos utilizada para modelar la red social y el motor de recomendaciones. Aquí residen los nodos de cuenta (`AccountNode`) y las relaciones complejas como `FOLLOWS`, `LIKED`, `REVIEWED` y `SHARES_BUSINESS_TYPE`. Esto nos permite realizar consultas eficientes de "amigos de amigos" o recomendaciones basadas en gustos similares.
        *   *Referencia*: `com.tripmates.backend.users.entity.neo4j.AccountNode`

### 3. Instalación y Ejecución Local

Sigue estos pasos para desplegar el proyecto en tu entorno local.

> **🚀 Nota para Desarrolladores**: Al levantar el backend, el sistema carga automáticamente un conjunto de datos de prueba (usuarios y negocios) definidos en `backend/src/main/resources/config/data/user-credentials.json`. Esto te permitirá probar todas las funcionalidades (login, feed, recomendaciones) sin necesidad de crear datos manualmente desde cero.

#### Pasos

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/usuario/tripmates.git
    cd tripmates
    ```

2.  **Configurar Variables de Entorno (CRÍTICO)**
    Antes de iniciar, es necesario configurar las credenciales del backend.
    *   Dirígete al directorio del backend: `cd backend`
    *   Copia el archivo de ejemplo: `cp .env.example .env`
    *   **Edita el archivo `.env`**: Es vital configurar los servicios externos para que la aplicación funcione correctamente (subida de imágenes y envío de correos).

    > **☁️ Configuración de Cloudinary (Imágenes)**
    > 1. Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com/).
    > 2. Ve al **Dashboard** y copia: `Cloud Name`, `API Key` y `API Secret`.
    > 3. Pégalos en las variables `CLOUDINARY_*` de tu archivo `.env`.
    
    > **📧 Configuración de Gmail (Correos)**
    > 1. Usa una cuenta de Gmail y activa la **Verificación en dos pasos (2FA)**.
    > 2. Ve a *Gestionar tu cuenta de Google* > *Seguridad* > *Verificación en dos pasos* > *Contraseñas de aplicaciones*.
    > 3. Genera una nueva contraseña (ej: "Tripmates Local") y copia el código de 16 caracteres.
    > 4. Pega ese código en `GMAIL_KEY` y tu correo en `GMAIL_NAME`. **No uses tu contraseña habitual.**

3.  **Levantar Backend y Bases de Datos**
    Utilizamos Docker Compose para iniciar los servicios de soporte (Mongo, Neo4j) y la aplicación backend.
    ```bash
    # Estando en la carpeta /backend
    docker compose up --build -d
    ```

4.  **Iniciar el Frontend**
    En una nueva terminal, navega a la carpeta del frontend e inicia el servidor de desarrollo.
    ```bash
    cd ../frontend
    # Estando en la carpeta /frontend
    docker compose up --build -d
    ```
    La aplicación estará disponible generalmente en `http://localhost:5173`.
