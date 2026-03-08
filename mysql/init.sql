-- ==========================================
-- CREAR BASE DE DATOS
-- ==========================================

CREATE DATABASE IF NOT EXISTS rdam;
USE rdam;

-- ==========================================
-- ROLES
-- ==========================================

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES
('ADMIN'),
('OPERADOR'),
('CIUDADANO');

-- ==========================================
-- DISTRITOS
-- ==========================================

CREATE TABLE distritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

INSERT INTO distritos (nombre) VALUES
('Santa Fe'),
('Rosario'),
('Reconquista');

-- ==========================================
-- USUARIOS INTERNOS
-- ==========================================

CREATE TABLE usuarios_internos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  rol_id INT,
  distrito_id INT,
  activo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- password = 123456 (bcrypt)
INSERT INTO usuarios_internos
(nombre, apellido, email, password_hash, rol_id, distrito_id)
VALUES
(
'Administrador',
'Sistema',
'admin@rdam.com',
'$2b$10$CwTycUXWue0Thq9StjUM0uJ8cY9qsJh0kGugHgdGXNq35p3xNmPRK',
1,
NULL
);

INSERT INTO usuarios_internos
(nombre, apellido, email, password_hash, rol_id, distrito_id)
VALUES
(
'Operador',
'Santa Fe',
'operador@rdam.com',
'$2b$10$CwTycUXWue0Thq9StjUM0uJ8cY9qsJh0kGugHgdGXNq35p3xNmPRK',
2,
1
);

-- ==========================================
-- SOLICITUDES
-- ==========================================

CREATE TABLE solicitudes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nro_tramite VARCHAR(30) UNIQUE,
  email VARCHAR(150),
  cuil VARCHAR(20),
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  distrito_id BIGINT,
  estado VARCHAR(30) DEFAULT 'PENDIENTE',
  referencia_pago VARCHAR(100),
  fecha_pago DATETIME,
  fecha_publicacion DATETIME,
  fecha_vencimiento DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AUDITORIA
-- ==========================================

CREATE TABLE auditoria_solicitudes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id BIGINT,
  usuario_interno_id BIGINT,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  accion VARCHAR(100),
  observaciones TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TOKENS OTP
-- ==========================================

CREATE TABLE public_login_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150),
  token VARCHAR(10),
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

INSERT INTO solicitudes
(nro_tramite,email,cuil,nombre,apellido,distrito_id,estado)
VALUES
(
'RDAM-20260101-0001',
'usuario@test.com',
'20345678901',
'Juan',
'Perez',
1,
'PENDIENTE'
);

INSERT INTO solicitudes
(nro_tramite,email,cuil,nombre,apellido,distrito_id,estado,fecha_pago)
VALUES
(
'RDAM-20260101-0002',
'usuario@test.com',
'20345678901',
'Juan',
'Perez',
1,
'PAGADO',
NOW()
);

INSERT INTO solicitudes
(nro_tramite,email,cuil,nombre,apellido,distrito_id,estado,fecha_pago,fecha_publicacion)
VALUES
(
'RDAM-20260101-0003',
'usuario@test.com',
'20345678901',
'Juan',
'Perez',
1,
'PUBLICADO',
NOW(),
NOW()
);