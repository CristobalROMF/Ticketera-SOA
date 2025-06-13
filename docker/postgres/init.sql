-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('cliente', 'tecnico', 'admin'))
);

-- Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tecnico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('creado', 'asignado', 'en trámite', 'cerrado con problemas', 'cerrado')),
    asunto VARCHAR(100) NOT NULL,
    descripcion TEXT CHECK (char_length(descripcion) <= 500)
);

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Cliente 1', 'cliente1@mail.com', 'hash1', 'cliente'),
('Cliente 2', 'cliente2@mail.com', 'hash2', 'cliente'),
('Cliente 3', 'cliente3@mail.com', 'hash3', 'cliente'),
('Tecnico A', 'tecnico@mail.com', 'hashT', 'tecnico'),
('Admin A', 'admin@mail.com', 'hashA', 'admin');

-- Insertar tickets de prueba
INSERT INTO tickets (cliente_id, tecnico_id, estado, asunto, descripcion) VALUES
(1, 4, 'en trámite', 'Error de inicio de sesión', 'No puedo acceder a mi cuenta luego de un reinicio.'),
(2, 4, 'asignado', 'Impresora desconectada', 'La impresora no responde en la red compartida del área de ventas.'),
(3, 4, 'creado', 'Problema con VPN', 'Problemas con la conexión VPN desde casa.');

-- VISTA: Dashboard para Cliente
CREATE OR REPLACE VIEW vista_dashboard_cliente AS
SELECT
    t.id AS id_ticket,
    u.nombre AS nombre_cliente,
    t.asunto,
    t.estado,
    t.fecha_creacion
FROM tickets t
JOIN usuarios u ON t.cliente_id = u.id
WHERE u.rol = 'cliente';

-- VISTA: Dashboard para Técnico
CREATE OR REPLACE VIEW vista_dashboard_tecnico AS
SELECT
    t.id AS id_ticket,
    cli.nombre AS nombre_cliente,
    tec.nombre AS tecnico_asignado,
    t.estado,
    t.asunto,
    t.fecha_creacion
FROM tickets t
JOIN usuarios cli ON t.cliente_id = cli.id
LEFT JOIN usuarios tec ON t.tecnico_id = tec.id
WHERE tec.rol = 'tecnico';

-- VISTA: Dashboard para Administrador
CREATE OR REPLACE VIEW vista_dashboard_admin AS
SELECT
    t.id AS id_ticket,
    cli.nombre AS nombre_cliente,
    tec.nombre AS tecnico_asignado,
    t.estado,
    t.asunto,
    t.fecha_creacion
FROM tickets t
JOIN usuarios cli ON t.cliente_id = cli.id
LEFT JOIN usuarios tec ON t.tecnico_id = tec.id;
