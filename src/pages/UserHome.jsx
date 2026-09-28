import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserHome() {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [errorSearch, setErrorSearch] = useState('');
  
  const [dispositivo, setDispositivo] = useState('');
  const [falla, setFalla] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorSearch('');
    setPerfil(null);
    try {
      const res = await axios.get(`http://localhost:8000/usuarios/${searchId.trim()}`);
      setPerfil(res.data.usuario);
    } catch (err) {
      setErrorSearch(err.response?.data?.message || 'Identificador no encontrado en la base de datos.');
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    // Aquí luego conectaremos el POST para tickets
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setDispositivo('');
      setFalla('');
    }, 4000);
  };

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #475569', 
    background: '#0f172a', color: '#f8fafc', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Botón de regreso independiente */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 30px auto' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← Regresar al Portal
        </button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
        
        {/* PANEL IZQUIERDO: Consulta */}
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#ffffff', fontSize: '1.8rem' }}>Consultar Cuenta Registrada</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>Ingresa tu ID registrado para validar tu cuenta en Supabase y ver el estado de tu equipo.</p>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <input 
              type="text" 
              placeholder="ID Usuario (ej: TEC-001)" 
              required 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={{ padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}>
              Validar Identidad
            </button>
          </form>

          {errorSearch && <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '14px' }}>{errorSearch}</div>}

          {perfil && (
            <div style={{ marginTop: '25px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                <span style={{ color: '#10b981', fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase' }}>Cuenta Verificada</span>
              </div>
              <h3 style={{ color: '#ffffff', margin: '0 0 5px 0', fontSize: '1.4rem' }}>{perfil.nombre}</h3>
              <p style={{ color: '#94a3b8', margin: '0', fontSize: '14px' }}>{perfil.email}</p>
            </div>
          )}
        </div>

        {/* PANEL DERECHO: Nueva Orden */}
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#ffffff', fontSize: '1.8rem' }}>Crear Orden de Reparación</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>Detalla el equipo y la avería para generar un nuevo ticket en la mesa técnica.</p>

          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input 
              type="text" 
              placeholder="Equipo (ej: Laptop Dell, S24 Ultra)" 
              required 
              value={dispositivo} 
              onChange={(e) => setDispositivo(e.target.value)}
              style={inputStyle}
            />
            
            <textarea 
              placeholder="Describa el síntoma o avería..." 
              required 
              rows="4"
              value={falla} 
              onChange={(e) => setFalla(e.target.value)}
              style={{...inputStyle, resize: 'vertical'}}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '14px' }}>Urgencia:</label>
              <select 
                value={prioridad} 
                onChange={(e) => setPrioridad(e.target.value)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#f8fafc', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Baja">Baja - Mantenimiento Preventivo</option>
                <option value="Media">Media - Falla Estándar</option>
                <option value="Alta">Alta - Equipo inoperable (Crítico)</option>
              </select>
            </div>

            <button type="submit" style={{ padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }}>
              Emitir informe
            </button>
          </form>

          {ticketSuccess && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
              Reporte emitido y enviado a la mesa técnica.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}