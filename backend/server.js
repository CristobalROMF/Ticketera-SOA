const net = require('net');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// DB config
const db = new Client({
  user: 'ticket',
  host: 'localhost',
  database: 'ticketdb',
  password: '1234',
  port: 5432
});
db.connect();

// Conexión al bus
const sock = new net.Socket();
sock.connect(5000, 'localhost', () => {
  sock.write(Buffer.from('00010sinitusuar'));
});

let sinit = true;
sock.on('data', async (data) => {
  if (sinit) {
    sinit = false;
    return;
  }

  const mensaje = data.toString();
  const servicio = mensaje.slice(5, 10);
  const contenido = mensaje.slice(10);

  if (servicio === 'usuar') {
    const partes = contenido.split(',');
    if (partes.length === 4) {
      const [nombre, correo, rol,contrasena] = partes;
      console.log("entrada:", partes);
      const contrasenaHash = await bcrypt.hash(contrasena, 10);
      console.log("contraseña hash", contrasenaHash);
      await db.query('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4)', [nombre, correo, contrasenaHash, rol]);
      const respuesta = `Usuario ${nombre} registrado`;
      const msg = `${(respuesta.length + 13).toString().padStart(5, '0')}usuarOK${respuesta}`;
      sock.write(Buffer.from(msg));
    } else if (partes.length === 2) {
      const [correo, contrasena] = partes;
      const res = await db.query('SELECT * FROM usuarios WHERE correo=$1', [correo]);
      if (res.rows.length === 1 && await bcrypt.compare(contrasena, res.rows[0].contrasena)) {
        const respuesta = `login correcto`;
        const msg1 = `${(respuesta.length + 13).toString().padStart(5, '0')}usuarOK${respuesta}`;
        sock.write(Buffer.from(msg1));
        const u = res.rows[0];
        const token = Buffer.from(`${u.id}:${u.nombre}:${u.rol}`).toString('base64');
        const msg = `${(token.length + 13).toString().padStart(5, '0')}usuarOK${token}`;
        sock.write(Buffer.from(msg));
      } else {
        const msg = `00017usuarNKLogin inválido`;
        sock.write(Buffer.from(msg));
      }
    }
  }
});