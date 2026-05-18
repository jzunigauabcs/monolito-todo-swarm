# Todo Swarm Monolith (Professional Workflow)

Este proyecto es una aplicación de "Todo List" diseñada para demostrar conceptos de Cloud Computing: orquestación con **Docker Swarm**, infraestructura como código con **Vagrant** y flujo de trabajo profesional con **Docker Hub**.

## Arquitectura

- **Frontend**: React + Vite (Nginx).
- **Backend**: Node.js + Express.
- **Base de Datos**: MySQL 8.0.
- **Orquestación**: Docker Swarm (1 Manager, 2 Workers).

## Requisitos

- [Vagrant](https://www.vagrantup.com/) y VirtualBox.
- Cuenta en [Docker Hub](https://hub.docker.com/).
- Docker instalado en tu máquina local.

---

## Paso 1: Preparar las Imágenes (En tu máquina local)

1. **Definir tu usuario de Docker Hub:**

   ```bash
   export DOCKER_USER="tu_usuario_dockerhub"
   ```

2. **Construir y subir el Backend:**

   ```bash
   docker build -t $DOCKER_USER/todo-api:latest ./api
   docker push $DOCKER_USER/todo-api:latest
   ```

3. **Construir y subir el Frontend:**
   _Importante: Pasamos la IP del Manager (192.168.56.10) para que el navegador sepa dónde encontrar el API._
   ```bash
   docker build --build-arg VITE_API_URL=http://192.168.56.10:3000 -t $DOCKER_USER/todo-client:latest ./client
   docker push $DOCKER_USER/todo-client:latest
   ```

---

## Paso 2: Levantar la Infraestructura

1. **Iniciar las VMs:**

   ```bash
   cd infrastructure
   vagrant up
   ```

2. **Inicializar el Swarm (En el Manager):**

   ```bash
   vagrant ssh manager
   docker swarm init --advertise-addr 192.168.56.10
   ```

   _Copia el comando `docker swarm join --token ...` que se genera._

3. **Unir los Workers:**
   En terminales nuevas, entra a `worker1` y `worker2` y pega el comando `join`.
   ```bash
   vagrant ssh worker1 # Pegar comando join
   vagrant ssh worker2 # Pegar comando join
   ```

---

## Paso 3: Desplegar el Stack (En el Manager)

Desde la terminal del `manager`, dentro de la carpeta compartida:

1. **Configurar el entorno y desplegar:**
   ```bash
   cd /vagrant
   export DOCKER_USER="tu_usuario_dockerhub"
   docker stack deploy -c docker-compose.yml todoapp
   ```

---

## Paso 4: Verificación y Demo

- **Acceso App**: `http://192.168.56.10`
- **Ver Nodos**: `docker node ls`
- **Ver Distribución de Tareas**: `docker stack ps todoapp`
- **Escalar API**: `docker service scale todoapp_api=5`
