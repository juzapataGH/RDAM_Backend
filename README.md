# RDAM - Registro Digital de Antecedentes

Sistema web para la **gestión, pago y emisión de certificados de antecedentes** desarrollado como proyecto académico.
El sistema permite a los ciudadanos solicitar certificados y al personal judicial revisarlos, aprobarlos y emitirlos digitalmente.

El proyecto incluye integración con una **pasarela de pago simulada (PlusPagos Mock)** y está completamente **dockerizado** para facilitar su ejecución.

---

# Arquitectura del sistema

El sistema está compuesto por tres servicios principales ejecutados mediante Docker Compose.

```
Usuario
   │
   ▼
RDAM API (Node.js / Express)
   │
   ├── MySQL (Base de datos)
   │
   └── PlusPagos Mock (Simulador de pasarela de pago)
```

Servicios:

* **rdam-api** → API backend en Node.js
* **mysql** → Base de datos MySQL
* **pluspagos-mock** → Simulador de pasarela de pagos

---

# Tecnologías utilizadas

Backend

* Node.js
* Express
* MySQL
* JWT
* bcrypt

Infraestructura

* Docker
* Docker Compose

Otras librerías

* mysql2
* dotenv
* cors
* pdfkit
* node-cron

---

# Requisitos

Para ejecutar el proyecto solo se necesita:

* Docker
* Docker Compose

No es necesario instalar Node.js ni MySQL en el sistema.

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/TU_USUARIO/rdam.git
cd rdam
```

Crear archivo de variables de entorno:

```bash
cp .env.example .env
```

Levantar los contenedores:

```bash
docker compose up --build
```

---

# Servicios disponibles

Una vez levantado el sistema:

| Servicio            | URL                             |
| ------------------- | ------------------------------- |
| RDAM API            | http://localhost:3000           |
| PlusPagos Mock      | http://localhost:3010           |
| Dashboard PlusPagos | http://localhost:3010/dashboard |
| MySQL               | localhost:3307                  |

---

# Credenciales de prueba (PlusPagos Mock)

GUID

```
test-merchant-001
```

Secret Key

```
clave-secreta-campus-2026
```

---

# Tarjetas de prueba

| Tarjeta             | Resultado      |
| ------------------- | -------------- |
| 4242 4242 4242 4242 | Pago aprobado  |
| 4000 0000 0000 0002 | Pago rechazado |
| 5555 5555 5555 4444 | Pago aprobado  |

Datos adicionales:

```
Nombre: Juan Perez
Expiración: 12/30
CVV: 123
```

---

# Base de datos

La base de datos se inicializa automáticamente mediante:

```
mysql/init.sql
```

Al iniciar los contenedores por primera vez se crean:

* base de datos `rdam`
* tablas del sistema
* datos iniciales

---

# Flujo del sistema

1. El ciudadano crea una solicitud de certificado
2. El sistema genera una orden de pago
3. El usuario es redirigido a la pasarela PlusPagos Mock
4. Se simula el pago con tarjeta de prueba
5. La pasarela envía callback/webhook al sistema
6. RDAM actualiza el estado de la solicitud

---

# Estructura del proyecto

```
rdam
│
├── src
│   ├── controllers
│   ├── routes
│   ├── services
│   └── server.js
│
├── mysql
│   └── init.sql
│
├── pasarela-campus-2026
│   └── pluspagos-mock-simple
│
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

---

# Desarrollo

Para reiniciar completamente los contenedores:

```bash
docker compose down -v
docker compose up --build
```

Ver logs de la API:

```bash
docker logs rdam-api
```

Ver logs de la base de datos:

```bash
docker logs rdam-mysql
```

---

# Autor

Proyecto desarrollado por estudiantes como parte del **Summer Campus 2026 – i2T Software Factory**.

---

# Licencia

Proyecto con fines educativos.
