CREATE TABLE IF NOT EXISTS saludos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje VARCHAR(255) NOT NULL
);

INSERT INTO saludos (mensaje) VALUES ('Conexion exitosa a MySQL');