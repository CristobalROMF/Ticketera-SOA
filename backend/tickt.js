const net = require('net');
const { Client } = require('pg');

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
  sock.write(Buffer.from('00010sinittickt'));
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

  if (servicio === 'tickt') {
    const comando = contenido.split('|')[0];

    if (comando === 'listar') {
      const [, rolid] = contenido.split('|');
      const [rol, id] = rolid.split(':');
      let result;
      if (rol === 'cliente') {
        result = await db.query(`
          SELECT t.id, t.asunto, u.nombre AS cliente, t.estado
          FROM tickets t
          JOIN usuarios u ON u.id = t.cliente_id
          WHERE cliente_id = $1
        `, [id]);
      } else if (rol === 'tecnico') {
        result = await db.query(`
          SELECT t.id, t.asunto, u.nombre AS cliente, t.estado
          FROM tickets t
          JOIN usuarios u ON u.id = t.cliente_id
          WHERE tecnico_id = $1
        `, [id]);
      } else {
        result = await db.query(`
          SELECT t.id, t.asunto, u.nombre AS cliente, t.estado
          FROM tickets t
          JOIN usuarios u ON u.id = t.cliente_id
        `);
      }
      const datos = JSON.stringify(result.rows);
      const msg = `\${(datos.length + 13).toString().padStart(5, '0')}ticktOK\${datos}`;
      sock.write(Buffer.from(msg));
    }

    if (comando === 'modificar') {
      const [, args] = contenido.split('|');
      const [id, estado, tecnico_id, asunto, descripcion] = args.split(':');
      await db.query(`
        UPDATE tickets SET estado=$1, tecnico_id=$2, asunto=$3, descripcion=$4
        WHERE id = $5
      `, [estado, tecnico_id || null, asunto, descripcion, id]);
      const msg = `\${(29).toString().padStart(5, '0')}ticktOKTicket actualizado`;
      sock.write(Buffer.from(msg));
    }
  }
});