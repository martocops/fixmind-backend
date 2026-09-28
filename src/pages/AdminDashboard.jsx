import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('diagnosticos');
  
  // ================= TALLERES (SUPABASE) =================
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busquedaTaller, setBusquedaTaller] = useState('');

  // ================= DIAGNÓSTICOS (CMS) =================
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [busquedaDiag, setBusquedaDiag] = useState('');
  const [modalDiag, setModalDiag] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [diagForm, setDiagForm] = useState({ id: null, titulo: '', categoria: 'controles', desc: '', pdfNombre: '', videoUrl: '' });

  const configCategoria = {
    controles: { badge: 'Control', icon: 'fa-gamepad', colorIcon: 'bg-pink-100 text-pink-600' },
    celulares: { badge: 'Celular', icon: 'fa-mobile-screen', colorIcon: 'bg-sky-100 text-sky-600' },
    audifonos: { badge: 'Audífonos', icon: 'fa-headphones', colorIcon: 'bg-purple-100 text-purple-600' },
    consolas: { badge: 'Consola', icon: 'fa-tv', colorIcon: 'bg-indigo-100 text-indigo-600' }
  };

  useEffect(() => {
    const sesion = localStorage.getItem('fixmind_user');
    if (sesion) {
      const u = JSON.parse(sesion);
      if (u.rol === 'admin') setAdminUser(u);
    }
    fetchUsuarios();
    cargarDiagnosticos();
  }, []);

  // --- Lógica Talleres ---
  const fetchUsuarios = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get('http://localhost:8000/usuarios');
      setUsuarios(res.data.datos || []);
    } catch (err) {
      setError('No se pudo conectar con el servidor Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Confirmas eliminar permanentemente el taller ${id}?`)) return;
    try {
      await axios.delete(`http://localhost:8000/usuarios/${id}`);
      fetchUsuarios();
    } catch (err) {
      alert('Error al intentar eliminar el registro.');
    }
  };

  // --- Lógica Diagnósticos ---
  const cargarDiagnosticos = () => {
    const guardados = localStorage.getItem('fixmind_diagnosticos');
    if (guardados) {
      setDiagnosticos(JSON.parse(guardados));
    } else {
      const defaults = [
        { id: 1, titulo: 'Drift en Joystick', categoria: 'controles', badge: 'Control', icon: 'fa-gamepad', colorIcon: 'bg-pink-100 text-pink-600', desc: 'Movimiento fantasma en los análogos. Desgaste de potenciómetros.', pdfNombre: 'Guia_Drift.pdf', videoUrl: 'https://youtube.com/watch?v=123' },
        { id: 2, titulo: 'Batería Degradada', categoria: 'celulares', badge: 'Celular', icon: 'fa-mobile-screen', colorIcon: 'bg-sky-100 text-sky-600', desc: 'Descarga rápida o apagones repentinos.', pdfNombre: 'Manual_Bateria.pdf', videoUrl: '' },
        { id: 3, titulo: 'Audio Desbalanceado', categoria: 'audifonos', badge: 'Audífonos', icon: 'fa-headphones', colorIcon: 'bg-purple-100 text-purple-600', desc: 'Volumen asimétrico por cerumen o fallo del driver.', pdfNombre: 'Limpieza_Audio.pdf', videoUrl: '' }
      ];
      setDiagnosticos(defaults);
      localStorage.setItem('fixmind_diagnosticos', JSON.stringify(defaults));
    }
  };

  const abrirModalCrear = () => {
    setEsEdicion(false);
    setDiagForm({ id: null, titulo: '', categoria: 'controles', desc: '', pdfNombre: '', videoUrl: '' });
    setModalDiag(true);
  };

  const abrirModalEditar = (diag) => {
    setEsEdicion(true);
    setDiagForm({ ...diag });
    setModalDiag(true);
  };

  const procesarDiagnostico = (e) => {
    e.preventDefault();
    const config = configCategoria[diagForm.categoria];
    const itemGuardar = {
      ...diagForm,
      badge: config.badge,
      icon: config.icon,
      colorIcon: config.colorIcon
    };

    let nuevosDatos;
    if (esEdicion) {
      nuevosDatos = diagnosticos.map(d => d.id === diagForm.id ? itemGuardar : d);
    } else {
      itemGuardar.id = Date.now();
      nuevosDatos = [...diagnosticos, itemGuardar];
    }

    setDiagnosticos(nuevosDatos);
    localStorage.setItem('fixmind_diagnosticos', JSON.stringify(nuevosDatos));
    setModalDiag(false);
  };

  const borrarDiagnostico = (id) => {
    if(!window.confirm('¿Eliminar este diagnóstico del sistema público?')) return;
    const nuevosDatos = diagnosticos.filter(d => d.id !== id);
    setDiagnosticos(nuevosDatos);
    localStorage.setItem('fixmind_diagnosticos', JSON.stringify(nuevosDatos));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('fixmind_user');
    navigate('/');
  };

  // Filtros
  const diagFiltrados = diagnosticos.filter(d => d.titulo.toLowerCase().includes(busquedaDiag.toLowerCase()));
  const talleresFiltrados = usuarios.filter(u => u.nombre.toLowerCase().includes(busquedaTaller.toLowerCase()) || u.id_usuario.toLowerCase().includes(busquedaTaller.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-900">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition" onClick={() => navigate('/')}>
          <i className="fa-solid fa-microchip text-teal-500 mr-3 text-xl"></i>
          <span className="font-extrabold text-white text-lg tracking-wide">FixMind Admin</span>
        </div>
        
        <div className="p-4 flex-grow flex flex-col gap-1 mt-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3">Gestión de Plataforma</p>
          
          <button 
            onClick={() => setVistaActiva('diagnosticos')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'diagnosticos' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <i className="fa-solid fa-layer-group w-5 text-center"></i> Catálogo de Fallas
          </button>
          
          <button 
            onClick={() => setVistaActiva('talleres')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${vistaActiva === 'talleres' ? 'bg-teal-500/10 text-teal-400' : 'hover:bg-slate-900 hover:text-white'}`}
          >
            <i className="fa-solid fa-shop w-5 text-center"></i> Red de Talleres
          </button>

          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed mt-2">
            <i className="fa-solid fa-chart-pie w-5 text-center"></i> Estadísticas (Próximamente)
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-900 flex items-center justify-center font-bold text-xs">AD</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{adminUser?.nombre || 'Administrador'}</p>
              <p className="text-[10px] text-slate-400 truncate">admin@fixmind.com</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold transition-all">
            <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-bold text-slate-800">
            {vistaActiva === 'talleres' ? 'Gestión de Técnicos Autorizados' : 'Administrador de Contenido CMS'}
          </h1>
          <div className="flex items-center gap-4 text-slate-400">
            <button className="hover:text-slate-600 transition"><i className="fa-solid fa-bell"></i></button>
            <button className="hover:text-slate-600 transition"><i className="fa-solid fa-gear"></i></button>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-grow">
          
          {/* ================= VISTA: CMS DIAGNÓSTICOS ================= */}
          {vistaActiva === 'diagnosticos' && (
            <div className="max-w-7xl mx-auto">
              {/* Barra de herramientas */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="Buscar por título o problema..." 
                    value={busquedaDiag} onChange={(e) => setBusquedaDiag(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
                <button onClick={abrirModalCrear} className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2">
                  <i className="fa-solid fa-plus"></i> Nuevo Registro
                </button>
              </div>

              {/* Tabla Profesional de Diagnósticos */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Dispositivo / Problema</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Recursos Adicionales</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {diagFiltrados.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No se encontraron diagnósticos.</td></tr>
                    ) : (
                      diagFiltrados.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.colorIcon}`}>
                                <i className={`fa-solid ${item.icon}`}></i>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{item.titulo}</p>
                                <p className="text-xs text-slate-500 truncate max-w-xs">{item.desc}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                              {item.badge}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${item.pdfNombre ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-300'}`} title={item.pdfNombre || 'Sin PDF'}>
                                <i className="fa-solid fa-file-pdf"></i>
                              </span>
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${item.videoUrl ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-300'}`} title={item.videoUrl || 'Sin Video'}>
                                <i className="fa-brands fa-youtube"></i>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => abrirModalEditar(item)} className="p-2 text-slate-400 hover:text-teal-600 transition" title="Editar">
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button onClick={() => borrarDiagnostico(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition" title="Eliminar">
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VISTA: TALLERES (SUPABASE) ================= */}
          {vistaActiva === 'talleres' && (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-sm"></i>
                  <input 
                    type="text" placeholder="Buscar técnico por nombre o ID..." 
                    value={busquedaTaller} onChange={(e) => setBusquedaTaller(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition"
                  />
                </div>
                <button onClick={fetchUsuarios} disabled={loading} className="w-full sm:w-auto bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
                  <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i> Sincronizar Supabase
                </button>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Identificador</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Taller / Técnico</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Correo de Acceso</th>
                      <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {talleresFiltrados.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No se encontraron talleres en Supabase.</td></tr>
                    ) : (
                      talleresFiltrados.map((u) => (
                        <tr key={u.id_usuario} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-xs text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{u.id_usuario}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">{u.nombre}</td>
                          <td className="px-6 py-4 text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDelete(u.id_usuario)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition border border-red-100">
                              Revocar Acceso
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODAL: CREAR/EDITAR DIAGNÓSTICO ================= */}
      {modalDiag && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button onClick={() => setModalDiag(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <h3 className="text-xl font-extrabold text-slate-900 mb-6">
              {esEdicion ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
            </h3>
            
            <form onSubmit={procesarDiagnostico} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título del Problema</label>
                <input 
                  type="text" required 
                  value={diagForm.titulo} onChange={e => setDiagForm({...diagForm, titulo: e.target.value})}
                  placeholder="Ej. Pantalla estrellada, No enciende..." 
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispositivo / Categoría</label>
                <select 
                  value={diagForm.categoria} onChange={e => setDiagForm({...diagForm, categoria: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                >
                  <option value="controles">Controles / Joysticks</option>
                  <option value="celulares">Celulares / Tablets</option>
                  <option value="audifonos">Audífonos / Audio</option>
                  <option value="consolas">Consolas de Videojuegos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción Breve</label>
                <textarea 
                  required rows="3"
                  value={diagForm.desc} onChange={e => setDiagForm({...diagForm, desc: e.target.value})}
                  placeholder="Explica brevemente el síntoma o solución." 
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1"><i className="fa-solid fa-file-pdf text-red-500 mr-1"></i> Archivo PDF</label>
                  <input 
                    type="text" 
                    value={diagForm.pdfNombre} onChange={e => setDiagForm({...diagForm, pdfNombre: e.target.value})}
                    placeholder="Ej. Guia_Fix.pdf" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1"><i className="fa-brands fa-youtube text-red-600 mr-1"></i> URL YouTube</label>
                  <input 
                    type="url" 
                    value={diagForm.videoUrl} onChange={e => setDiagForm({...diagForm, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/..." 
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-2">
                <button type="button" onClick={() => setModalDiag(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg hover:bg-slate-50 font-bold text-sm transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 font-bold text-sm transition shadow-md">
                  {esEdicion ? 'Guardar Cambios' : 'Publicar Diagnóstico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}