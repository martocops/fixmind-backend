import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState('all');
  const [busqueda, setBusqueda] = useState('');
  
  // ================= ESTADOS DE SESIÓN Y DATOS =================
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(null); 
  const [problemas, setProblemas] = useState([]);
  
  // Mi Colección
  const [miColeccion, setMiColeccion] = useState([]);
  const [modalColeccion, setModalColeccion] = useState(false);

  // Ficha Técnica (Vista Detalle Expandida)
  const [fichaActiva, setFichaActiva] = useState(null);
  const [modalFicha, setModalFicha] = useState(false);

  // Modales de Reparación y Guías
  const [modalAgendar, setModalAgendar] = useState(false);
  const [problemaSeleccionado, setProblemaSeleccionado] = useState('');
  const [modalManuales, setModalManuales] = useState(false);
  const [manualActivo, setManualActivo] = useState(null);
  const [modalTalleres, setModalTalleres] = useState(false);

  // Modales de Auth
  const [modalAuthCliente, setModalAuthCliente] = useState(false);
  const [isRegistroCliente, setIsRegistroCliente] = useState(false);
  const [clienteForm, setClienteForm] = useState({ nombre: '', email: '', password: '' });
  const [authClienteError, setAuthClienteError] = useState('');

  const [modalLoginTech, setModalLoginTech] = useState(false);
  const [rolLogin, setRolLogin] = useState('tech');
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ================= CARGA INICIAL =================
  useEffect(() => {
    const sesion = localStorage.getItem('fixmind_user');
    if (sesion) setUsuarioActivo(JSON.parse(sesion));

    // Plantilla base obligatoria con todos los datos de la Ficha Técnica
    const defaults = [
      { 
        id: 'FIX-101', 
        titulo: 'Drift en Joystick', 
        categoria: 'controles', 
        badge: 'Control', 
        icon: 'fa-gamepad', 
        colorIcon: 'bg-pink-100 text-pink-600', 
        desc: 'Movimiento fantasma en potenciómetros.', 
        pdfNombre: 'Guia_Drift.pdf', 
        videoUrl: '',
        voltaje: '3.3V',
        tiempoRep: '45 mins',
        dificultad: 'Media',
        herramientas: 'Cautín, Malla desoldadora, Flux'
      },
      { 
        id: 'FIX-102', 
        titulo: 'Batería Degradada', 
        categoria: 'celulares', 
        badge: 'Celular', 
        icon: 'fa-mobile-screen', 
        colorIcon: 'bg-sky-100 text-sky-600', 
        desc: 'El equipo se descarga rápidamente.', 
        pdfNombre: 'Manual_Bateria.pdf', 
        videoUrl: '',
        voltaje: '3.85V',
        tiempoRep: '30 mins',
        dificultad: 'Baja',
        herramientas: 'Pistola de calor, Ventosa, Espátula'
      },
      { 
        id: 'FIX-103', 
        titulo: 'Audio Desbalanceado', 
        categoria: 'audifonos', 
        badge: 'Audífonos', 
        icon: 'fa-headphones', 
        colorIcon: 'bg-purple-100 text-purple-600', 
        desc: 'Un lado suena mucho más bajo por saturación.', 
        pdfNombre: 'Limpieza_Audio.pdf', 
        videoUrl: '',
        voltaje: '5V USB',
        tiempoRep: '20 mins',
        dificultad: 'Baja',
        herramientas: 'Alcohol isopropílico, Cepillo antiestático'
      }
    ];

    // Cargar Diagnósticos
    const guardados = localStorage.getItem('fixmind_diagnosticos');
    let datosAUsar = defaults;

    if (guardados) {
      const parseados = JSON.parse(guardados);
      // Validación: Si el primer elemento existe pero NO empieza con "FIX-", 
      // significa que es data vieja. Sobrescribimos con los defaults.
      if (parseados.length > 0 && !String(parseados[0].id).startsWith('FIX-')) {
         localStorage.setItem('fixmind_diagnosticos', JSON.stringify(defaults));
         datosAUsar = defaults;
      } else {
         datosAUsar = parseados;
      }
    } else {
      // Si no hay nada guardado, metemos los defaults
      localStorage.setItem('fixmind_diagnosticos', JSON.stringify(defaults));
    }
    
    setProblemas(datosAUsar);

    // Cargar "Mi Colección"
    const coleccionGuardada = localStorage.getItem('fixmind_mi_coleccion');
    if (coleccionGuardada) {
      const colParse = JSON.parse(coleccionGuardada);
      if (colParse.length > 0 && !String(colParse[0].id).startsWith('FIX-')) {
        localStorage.removeItem('fixmind_mi_coleccion');
        setMiColeccion([]);
      } else {
        setMiColeccion(colParse);
      }
    }
  }, []); // <--- El error 130 pasaba justo aquí

  // ================= ACCIONES DE MI COLECCIÓN =================
  const guardarEnColeccion = (item) => {
    const existe = miColeccion.some(c => c.id === item.id);
    if (existe) {
      alert('Este elemento ya está guardado en Tu Colección.');
      return;
    }
    const nuevaColeccion = [...miColeccion, item];
    setMiColeccion(nuevaColeccion);
    localStorage.setItem('fixmind_mi_coleccion', JSON.stringify(nuevaColeccion));
    alert(`"${item.titulo}" se guardó en tu colección.`);
  };

  const eliminarDeColeccion = (id) => {
    const nuevaColeccion = miColeccion.filter(c => c.id !== id);
    setMiColeccion(nuevaColeccion);
    localStorage.setItem('fixmind_mi_coleccion', JSON.stringify(nuevaColeccion));
  };

  // ================= LÓGICA DE INTERCEPCIÓN (RUTAS PROTEGIDAS) =================
  const intentarAgendar = (titulo) => {
    if (!usuarioActivo) {
      setAccionPendiente({ tipo: 'agendar', payload: titulo });
      setAuthClienteError('');
      setModalAuthCliente(true);
    } else {
      setProblemaSeleccionado(titulo);
      setModalAgendar(true);
    }
  };

  const intentarAbrirColeccion = () => {
    if (!usuarioActivo) {
      setAccionPendiente({ tipo: 'abrir_coleccion' });
      setAuthClienteError('');
      setModalAuthCliente(true);
    } else {
      setModalColeccion(true);
    }
  };

  const intentarGuardarColeccion = (item) => {
    if (!usuarioActivo) {
      setAccionPendiente({ tipo: 'guardar_coleccion', payload: item });
      setAuthClienteError('');
      setModalAuthCliente(true);
    } else {
      guardarEnColeccion(item);
    }
  };

  // ================= LOGIN Y SESIONES =================
  const procesarAuthCliente = (e) => {
    e.preventDefault();
    setAuthClienteError('');
    let clientesDB = JSON.parse(localStorage.getItem('fixmind_clientes_db')) || [];

    if (isRegistroCliente) {
      const existe = clientesDB.find(c => c.email === clienteForm.email);
      if (existe) { setAuthClienteError('El correo ya existe.'); return; }
      const nuevo = { id_usuario: 'CLI-' + Date.now().toString().slice(-4), nombre: clienteForm.nombre, email: clienteForm.email, password: clienteForm.password, rol: 'cliente' };
      clientesDB.push(nuevo);
      localStorage.setItem('fixmind_clientes_db', JSON.stringify(clientesDB));
      iniciarSesionCliente(nuevo);
    } else {
      const u = clientesDB.find(c => c.email === clienteForm.email);
      if (!u) { setAuthClienteError('Usuario no encontrado.'); return; }
      if (u.password !== clienteForm.password) { setAuthClienteError('Contraseña incorrecta.'); return; }
      iniciarSesionCliente(u);
    }
  };

  const iniciarSesionCliente = (usuarioInfo) => {
    const sesion = { id_usuario: usuarioInfo.id_usuario, nombre: usuarioInfo.nombre, email: usuarioInfo.email, rol: 'cliente' };
    setUsuarioActivo(sesion);
    localStorage.setItem('fixmind_user', JSON.stringify(sesion));
    setModalAuthCliente(false);
    setClienteForm({ nombre: '', email: '', password: '' });

    if (accionPendiente?.tipo === 'agendar') {
      setProblemaSeleccionado(accionPendiente.payload);
      setModalAgendar(true);
    } else if (accionPendiente?.tipo === 'abrir_coleccion') {
      setModalColeccion(true);
    } else if (accionPendiente?.tipo === 'guardar_coleccion') {
      guardarEnColeccion(accionPendiente.payload);
    }
    setAccionPendiente(null);
  };

  const abrirLoginTechAdmin = (rol) => {
    setRolLogin(rol);
    setLoginError('');
    setCredenciales({ email: rol === 'admin' ? 'admin@fixmind.com' : '', password: '' });
    setModalLoginTech(true);
  };

  const ejecutarLoginTechAdmin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError('');
    try {
      const res = await axios.post('http://localhost:8000/login', { ...credenciales, rol: rolLogin });
      localStorage.setItem('fixmind_user', JSON.stringify(res.data.usuario));
      setUsuarioActivo(res.data.usuario);
      setModalLoginTech(false);
      navigate(rolLogin === 'admin' ? '/admin' : '/tech/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Filtro corregido (soporta búsqueda por ID y por números sin romperse)
  const problemasFiltrados = problemas.filter((p) => {
    const coincideCat = categoria === 'all' || p.categoria === categoria;
    const coincideTexto = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                          p.desc.toLowerCase().includes(busqueda.toLowerCase()) ||
                          String(p.id).toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  return (
    <div className="w-full min-h-screen flex flex-col text-slate-800 bg-slate-50 font-sans">
      
      {/* ================= HEADER ================= */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
            <i className="fa-solid fa-microchip text-teal-600"></i> FixMind
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => document.getElementById('diagnostico').scrollIntoView({ behavior: 'smooth' })} className="hover:text-teal-600 transition">Diagnóstico</button>
            <button onClick={() => setModalManuales(true)} className="hover:text-teal-600 transition">Guías y Manuales</button>
            <button onClick={() => setModalTalleres(true)} className="hover:text-teal-600 transition">Talleres Certificados</button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={intentarAbrirColeccion} 
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <i className="fa-solid fa-box-archive text-teal-600"></i> Mi Colección {usuarioActivo && `(${miColeccion.length})`}
            </button>

            {usuarioActivo ? (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                <i className="fa-solid fa-user-circle text-teal-600"></i> {usuarioActivo.nombre}
                {usuarioActivo.rol !== 'cliente' && (
                  <button onClick={() => navigate(usuarioActivo.rol === 'admin' ? '/admin' : '/tech/dashboard')} className="bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] ml-1">Panel</button>
                )}
                <button onClick={() => { localStorage.removeItem('fixmind_user'); setUsuarioActivo(null); }} className="text-red-500 hover:text-red-700 ml-1">Salir</button>
              </div>
            ) : (
              <>
                <button onClick={() => { setIsRegistroCliente(false); setAuthClienteError(''); setModalAuthCliente(true); }} className="text-slate-600 hover:text-teal-600 text-xs font-bold px-2 py-1">Iniciar Sesión</button>
                <button onClick={() => abrirLoginTechAdmin('tech')} className="text-slate-500 hover:text-teal-600 text-xs font-semibold px-2 py-1 border border-slate-200 rounded">Técnico</button>
                <button onClick={() => abrirLoginTechAdmin('admin')} className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1 border border-slate-200 rounded">Admin</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO & BUSCADOR ================= */}
      <section className="w-full bg-slate-900 text-white py-16 px-4 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold tracking-wider mb-4 border border-teal-500/30">
            BASE DE DATOS Y DIAGNÓSTICO
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Catálogo Inteligente de Reparaciones
          </h1>
          <p className="text-slate-300 text-sm md:text-base mb-8 max-w-2xl mx-auto">
            Consulta fallas técnicas por ID, nombre o categoría y almacénalas en tu colección.
          </p>
          <div className="relative max-w-xl mx-auto">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-4 text-slate-400"></i>
            <input
              type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="block w-full pl-12 pr-4 py-3.5 rounded-xl text-slate-900 bg-white border-0 shadow-xl focus:ring-4 focus:ring-teal-500 outline-none text-sm"
              placeholder="Buscar por ID (ej. FIX-101), Nombre o Componente..."
            />
          </div>
        </div>
      </section>

      {/* ================= TARJETAS ================= */}
      <main id="diagnostico" className="w-full flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {['all', 'controles', 'celulares', 'audifonos'].map((cat) => (
            <button
              key={cat} onClick={() => setCategoria(cat)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold capitalize transition ${categoria === cat ? 'border-teal-500 bg-teal-50 text-teal-700' : 'bg-white border-slate-300 text-slate-600'}`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problemasFiltrados.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.colorIcon || 'bg-slate-100 text-slate-600'}`}>
                    <i className={`fa-solid ${item.icon || 'fa-microchip'}`}></i>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">ID: {item.id}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.badge || 'Equipo'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{item.titulo}</h3>
                <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button onClick={() => { setFichaActiva(item); setModalFicha(true); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                  <i className="fa-solid fa-file-invoice"></i> Ver Ficha Técnica
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setManualActivo(item); setModalManuales(true); }} className="py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-file-pdf text-red-500"></i> PDF
                  </button>
                  <button 
                    onClick={() => {
                      if (item.videoUrl) window.open(item.videoUrl, '_blank');
                      else window.open(`https://www.youtube.com/results?search_query=reparar+${encodeURIComponent(item.titulo)}`, '_blank');
                    }}
                    className="py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-brands fa-youtube text-red-600"></i> Video
                  </button>
                </div>
                <button onClick={() => intentarAgendar(item.titulo)} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-xs font-bold transition">
                  Agendar Reparación
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL: FICHA TÉCNICA ================= */}
      {modalFicha && fichaActiva && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
            <button onClick={() => setModalFicha(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${fichaActiva.colorIcon}`}>
                <i className={`fa-solid ${fichaActiva.icon}`}></i>
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">ID: {fichaActiva.id}</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{fichaActiva.titulo}</h3>
                <p className="text-xs text-slate-500 font-medium">Categoría: {fichaActiva.badge}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico Oficial</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{fichaActiva.desc}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dificultad</span>
                  <span className="text-xs font-extrabold text-slate-800">{fichaActiva.dificultad || 'Media'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo Est.</span>
                  <span className="text-xs font-extrabold text-slate-800">{fichaActiva.tiempoRep || '30 mins'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Voltaje Ref.</span>
                  <span className="text-xs font-extrabold text-slate-800">{fichaActiva.voltaje || '3.3V'}</span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Herramientas Recomendadas</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <i className="fa-solid fa-wrench text-teal-600 mr-1.5"></i>{fichaActiva.herramientas || 'Destornillador Phillips, Multímetro, Pinzas'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => intentarGuardarColeccion(fichaActiva)}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-bookmark"></i> Guardar en Mi Colección
              </button>
              <button onClick={() => setModalFicha(false)} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MI COLECCIÓN ================= */}
      {modalColeccion && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 relative max-h-[85vh] flex flex-col">
            <button onClick={() => setModalColeccion(false)} className="absolute top-5 right-6 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            
            <div className="mb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-box-archive text-teal-600"></i> Mi Colección
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Diagnósticos y fichas técnicas guardadas para consulta rápida.
              </p>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {miColeccion.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <i className="fa-regular fa-folder-open text-4xl mb-3 block text-slate-300"></i>
                  <p className="text-sm font-semibold">No hay dispositivos en tu colección.</p>
                  <p className="text-xs text-slate-400 mt-1">Abre una Ficha Técnica y haz clic en "Guardar en Mi Colección".</p>
                </div>
              ) : (
                miColeccion.map((elem) => (
                  <div key={elem.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between bg-slate-50/60 hover:bg-white transition shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${elem.colorIcon}`}>
                        <i className={`fa-solid ${elem.icon}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">{elem.id}</span>
                          <h4 className="font-bold text-sm text-slate-900">{elem.titulo}</h4>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{elem.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => eliminarDeColeccion(elem.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-xs font-bold transition" title="Eliminar de mi colección">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setModalColeccion(false)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold">Cerrar Colección</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALES DE AUTH Y OTROS ================= */}
      {modalAuthCliente && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
            <button onClick={() => setModalAuthCliente(false)} className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-slate-900">{isRegistroCliente ? 'Crear Cuenta' : 'Iniciar Sesión'}</h3>
              <p className="text-xs text-slate-500 mt-1">Identifícate para agendar o acceder a tu colección.</p>
            </div>
            {authClienteError && <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-lg">{authClienteError}</div>}
            <form onSubmit={procesarAuthCliente} className="space-y-3">
              {isRegistroCliente && (
                <input type="text" required placeholder="Nombre Completo" value={clienteForm.nombre} onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})} className="w-full border rounded-xl p-3 text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" />
              )}
              <input type="email" required placeholder="tu@correo.com" value={clienteForm.email} onChange={e => setClienteForm({...clienteForm, email: e.target.value})} className="w-full border rounded-xl p-3 text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" />
              <input type="password" required placeholder="Contraseña" value={clienteForm.password} onChange={e => setClienteForm({...clienteForm, password: e.target.value})} className="w-full border rounded-xl p-3 text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" />
              <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-xs mt-2">{isRegistroCliente ? 'Registrarse' : 'Entrar'}</button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500 cursor-pointer text-teal-600 font-bold" onClick={() => setIsRegistroCliente(!isRegistroCliente)}>
              {isRegistroCliente ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo usuario? Crea una cuenta'}
            </p>
          </div>
        </div>
      )}

      {modalLoginTech && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative">
            <button onClick={() => setModalLoginTech(false)} className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{rolLogin === 'admin' ? 'Acceso Administrador' : 'Acceso Técnico / Taller'}</h3>
            {loginError && <div className="p-3 mb-3 bg-red-50 text-red-700 text-xs rounded-lg">{loginError}</div>}
            <form onSubmit={ejecutarLoginTechAdmin} className="space-y-3">
              <input type="email" required placeholder="Correo" value={credenciales.email} onChange={e => setCredenciales({...credenciales, email: e.target.value})} className="w-full border rounded-xl p-3 text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" />
              <input type="password" required placeholder="Contraseña" value={credenciales.password} onChange={e => setCredenciales({...credenciales, password: e.target.value})} className="w-full border rounded-xl p-3 text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" />
              <button type="submit" disabled={loginLoading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs">{loginLoading ? 'Validando...' : 'Entrar'}</button>
            </form>
            {rolLogin === 'tech' && (
              <p className="mt-4 text-center text-xs text-teal-600 font-bold cursor-pointer" onClick={() => { setModalLoginTech(false); navigate('/tech/registro'); }}>¿No tienes cuenta? Regístrate aquí</p>
            )}
          </div>
        </div>
      )}

      {modalAgendar && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setModalAgendar(false)} className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">Agendar Cita</h3>
            <p className="text-xs text-slate-500 mb-4">Avería: <span className="font-bold text-slate-800">{problemaSeleccionado}</span></p>
            <form onSubmit={(e) => { e.preventDefault(); setModalAgendar(false); alert('Cita agendada con éxito.'); }} className="space-y-3">
              <select className="w-full border rounded-xl p-3 text-xs"><option>FixMind Centro Oficial (4.9★)</option></select>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required className="border rounded-xl p-3 text-xs" />
                <input type="time" required className="border rounded-xl p-3 text-xs" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold">Confirmar Cita</button>
            </form>
          </div>
        </div>
      )}

      {modalManuales && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative">
            <button onClick={() => setModalManuales(false)} className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <i className="fa-solid fa-file-pdf text-red-500 text-4xl mb-3"></i>
            <h3 className="text-base font-bold text-slate-900 mb-1">Manual Técnico</h3>
            <p className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg mb-4">{manualActivo ? manualActivo.pdfNombre : 'Manual_Oficial.pdf'}</p>
            <button onClick={() => setModalManuales(false)} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs">Cerrar</button>
          </div>
        </div>
      )}

      {modalTalleres && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button onClick={() => setModalTalleres(false)} className="absolute top-4 right-5 text-slate-400 hover:text-slate-700 text-2xl font-bold">×</button>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Talleres Verificados</h3>
            <div className="p-4 border rounded-xl bg-slate-50 flex justify-between items-center">
              <div><h4 className="font-bold text-sm">FixMind Centro Oficial</h4><p className="text-xs text-slate-500">Av. Insurgentes Sur 1024</p></div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">4.9 ★</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}