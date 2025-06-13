const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const net = require('net');
const cookieParser = require('cookie-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// POST general (registro y login)
app.post('/api', (req, res) => {
  const { servicio, datos } = req.body;
  console.log("entrada:", datos);
  const mensaje = `${(datos.length + 10).toString().padStart(5, '0')}${servicio}${datos}`;
  const client = new net.Socket();
  client.connect(5000, 'localhost', () => client.write(mensaje));

  let responseLength = null;
  let chunks = Buffer.alloc(0);

  client.on('data', (chunk) => {
    chunks = Buffer.concat([chunks, chunk]);
    if (responseLength === null && chunks.length >= 5)
      responseLength = parseInt(chunks.slice(0, 5).toString());
    if (chunks.length >= responseLength + 5) {
      const response = chunks.slice(5).toString();
      if (response.startsWith('usuarOK')) {
        const payload = response.slice(8);
        if (payload.includes(':')) {
          const decoded = Buffer.from(payload, 'base64').toString();
          const [id, nombre, rol] = decoded.split(':');
          res.cookie('usuario', JSON.stringify({ id, nombre, rol }), { httpOnly: false });
          res.send(`Login correcto: ${nombre} (${rol})`);
        } else res.send(payload);
      } else {
        res.status(401).send(response.slice(10));
      }
      client.destroy();
    }
  });
});

// GET dashboard de tickets
app.get('/tickets', (req, res) => {
  const usuario = JSON.parse(req.cookies.usuario || '{}');
  if (!usuario.id || !usuario.rol) return res.status(403).send('No autenticado');

  const datos = `listar|${usuario.rol}:${usuario.id}`;
  const mensaje = `${(datos.length + 10).toString().padStart(5, '0')}tickt${datos}`;

  const client = new net.Socket();
  client.connect(5000, 'localhost', () => client.write(mensaje));

  let responseLength = null;
  let chunks = Buffer.alloc(0);

  client.on('data', (chunk) => {
    chunks = Buffer.concat([chunks, chunk]);
    if (responseLength === null && chunks.length >= 5)
      responseLength = parseInt(chunks.slice(0, 5).toString());
    if (chunks.length >= responseLength + 5) {
      const response = chunks.slice(5).toString();
      const payload = JSON.parse(response.slice(8));
      res.json(payload);
      client.destroy();
    }
  });
});

app.listen(4000, () => console.log('Proxy frontend en 4000'));
