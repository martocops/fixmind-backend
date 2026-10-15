import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TechDashboard() {
  const navigate = useNavigate();
  const [tallerActivo, setTallerActivo] = useState(null);
  const [filtro, setFiltro] = useState('Todos');

  const [ordenes, setOrdenes] = useState([
    { id: 'ORD-101', cliente: 'Carlos Mendoza', equipo: 'Control PS5 DualSense', falla: 'Drift en Joystick Izquierdo', estado: 'Pendiente', presupuesto: 350 },
    { id: 'ORD-102', cliente: 'Ana Martínez', equipo: 'iPhone 13', falla: 'Batería degradada (15% salud)', estado: 'En Reparación', presupuesto: 720 },
    { id: 'ORD-103', cliente: 'Roberto Silva', equipo: 'Sony WH-1000XM4', falla: 'Audio desbalanceado por cerumen', estado: 'Listo para Entrega', presupuesto: 250 }
  ]);

  useEffect(() => {
    const sesion = localStorage.getItem('fixmind_user');
    if (sesion) {
      setTallerActivo(JSON.parse(sesion));
    }
  }, []);

  const avanzarEstado = (id) => {
    setOrdenes(ordenes.map(ord => {
      if (ord.id !== id) return ord;
      const nuevo = ord.estado === 'Pendiente' ? 'En Reparación' : ord.estado === 'En Reparación' ? 'Listo para Entrega' : 'Entregado';
      return { ...ord, estado: nuevo };
    }));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('fixmind_user');
    navigate('/');
  };

  const ordenesFiltradas = filtro === 'Todos' ? ordenes : ordenes.filter(o => o.estado === filtro);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
            <i className="fa-solid fa-microchip text-teal-600"></i> FixMind 
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2">Mesa Técnica</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
              <i className="fa-solid fa-shop text-teal-600 mr-1.5"></i>
              {tallerActivo ? tallerActivo.nombre : 'Taller Verificado'}
            </span>
            <button onClick={cerrarSesion} className="text-xs font-bold text-red-600 hover:underline">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Mesa de Trabajo Técnica</h1>
            <p className="text-xs text-slate-500">Gestión de diagnósticos y órdenes de reparación asignadas.</p>
          </div>
          <div className="flex gap-2">
            {['Todos', 'Pendiente', 'En Reparación', 'Listo para Entrega'].map(st => (
              <button
                key={st}
                onClick={() => setFiltro(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filtro === st ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-600'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ordenesFiltradas.map((ord) => (
            <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-teal-600">{ord.id}</span>
                  <h4 className="font-bold text-slate-900">{ord.equipo}</h4>
                  <span className="text-xs text-slate-400">({ord.cliente})</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{ord.falla}</p>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Presupuesto: ${ord.presupuesto} MXN
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {ord.estado}
                </span>
                <button 
                  onClick={() => avanzarEstado(ord.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition"
                >
                  Avanzar Estado →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}