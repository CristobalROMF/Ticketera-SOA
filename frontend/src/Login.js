import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [modo, setModo] = useState('login');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('cliente');
  const [mensaje, setMensaje] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const enviar = async () => {
    const datos = modo === 'registro'
      ? `${nombre},${correo},${rol},${contrasena}`
      : `${correo},${contrasena}`;

    const respuesta = await fetch('http://localhost:4000/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicio: 'usuar', datos }),
      credentials: 'include'
    });

    const texto = await respuesta.text();

    if (modo === 'registro') {
      if (texto.toLowerCase().includes('registrado')) {
        setMensaje('Registro exitoso');
      } else {
        setMensaje(texto);
      }
    }

    if (modo === 'login') {
      if (texto.toLowerCase().includes('login correcto')) {
        navigate('/dashboard');
      } else {
        setMensaje('Error en login');
      }
    }
  };

  return (
    <div className="App">
      <h1>{modo === 'registro' ? 'Registro' : 'Login'}</h1>
      {modo === 'registro' && <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />}
      <input placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} />
      {modo === 'registro' && (
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="tecnico">Técnico</option>
          <option value="admin">Administrador</option>
        </select>
      )}
      <input placeholder="Contraseña" type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} />
      <button onClick={enviar}>Enviar</button>
      <button onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}>Cambiar a {modo === 'login' ? 'Registro' : 'Login'}</button>
      <p>{mensaje}</p>
    </div>
  );
}

export default Login;