# OFMI Website 2.0

## Prerequisitos
- Tener Node Instalado (https://nodejs.org/en/)
- Tener Docker Desktop (preferiblemente) o Docker instalado (https://www.docker.com/products/docker-desktop/)


## Setup
- Clonar el respositorio con `git clone <url>`
- Copia el archivo `.env.example` y renombralo a `.env`
- Ejecuta `npm install` para instalar las dependencias
- Ejectuta `npm run setup` para iniciar la base de datos (necesario cada vez que quieras desarrollar)
- Ejectura `npm run dev` para iniciar el servidor de desarrollo

## Comandos utiles 
- `npx prisma studio` para visualizar la base de datos
- `docker exec -it ofmi_db bash` para entrar al contenedor de la base de datos con bash y luego `psql -U ofmi` para entrar a la base de datos con psql
  
## PgAdmin
- Util si necesitas mas control sobre la base de datos
- Ir a `localhost:5051`, iniciar sesion con `admin@ofmi.com` y `admin`
- La primera vez que entres, te pedirá la contraseña de la base de datos, la cual es `ofmi`

## Todo
- Agregar datos iniciales a la base de datos