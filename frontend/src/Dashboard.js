import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [usuario, setUsuario] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener info del usuario
    const cookies = document.cookie.split(';').find(c => c.includes('usuario'));
    if (!cookies) {
      navigate('/');
      return;
    }

    const data = JSON.parse(decodeURIComponent(cookies.split('=')[1]));
    setUsuario(data);

    // Cargar tickets
    fetch('http://localhost:4000/tickets', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setTickets(data));
  }, [navigate]);

  const cerrarSesion = () => {
    document.cookie = 'usuario=; Max-Age=0; path=/';
    navigate('/');
  };

  return (
    <div>
      <h2>Dashboard de {usuario.rol}</h2>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Asunto</th>
            <th>Cliente</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.asunto}</td>
              <td>{t.cliente}</td>
              <td>{t.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
