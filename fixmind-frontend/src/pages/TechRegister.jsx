import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function TechRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ id_usuario: '', nombre: '', email: '' });
  const [especialidades, setEspecialidades] = useState([]);
  const [herramientas, setHerramientas] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const [error, setError] = useState(null);

  const toggleSpec = (spec) => {
    setEspecialidades(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (especialidades.length === 0) {
      setError('Selecciona al menos una especialidad.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Guarda el nuevo taller en Supabase vía backend
      await axios.post('http://localhost:8000/usuarios', {
        id_usuario: formData.id_usuario.trim(),
        nombre: formData.nombre.trim(),
        email: formData.email.trim()
      });
      setRegistrado(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al persistir los datos en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sub-Nav Técnico */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900 cursor-pointer" onClick={() => navigate('/')}>
            <i className="fa-solid fa-microchip text-teal-600"></i> FixMind 
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md ml-2">Red de Talleres</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/tech/dashboard')} className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-slate-600 hover:text-slate-900 transition">
              Mi Panel Técnico →
            </button>
            <button onClick={() => navigate('/')} className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto px-4 py-10 w-full">
        {!registrado ? (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Únete a la Red de Reparación</h1>
              <p className="text-slate-500 text-sm">Registra tu taller, recibe validación y comienza a recibir diagnósticos en tu zona.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-base"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ID Único Técnico / RFC</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej: TEC-SUR-01" 
                      value={formData.id_usuario}
                      onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nombre Comercial del Taller</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. ElectroFix Sur" 
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Correo Electrónico de Contacto</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="contacto@electrofix.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" 
                    />
                  </div>

                  {/* Especialidades */}
                  <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">¿En qué te especializas?</label>
                    <div className="flex flex-wrap gap-3">
                      {['Controles', 'Celulares', 'Audífonos', 'Consolas', 'Laptops'].map(spec => (
                        <label key={spec} className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-lg border border-slate-200 hover:border-teal-500 text-xs font-semibold text-slate-700 transition">
                          <input 
                            type="checkbox" 
                            checked={especialidades.includes(spec)}
                            onChange={() => toggleSpec(spec)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          {spec}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Herramientas Principales</label>
                    <textarea 
                      rows="3" 
                      required 
                      value={herramientas}
                      onChange={(e) => setHerramientas(e.target.value)}
                      placeholder="Cautín JBC, Estación de calor, Microscopio trinocular..." 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Años de Experiencia y Referencias</label>
                    <textarea 
                      rows="3" 
                      required 
                      value={experiencia}
                      onChange={(e) => setExperiencia(e.target.value)}
                      placeholder="5 años en microsoldadura. Enlace a Google Maps..." 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Dropzone de fotos */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Fotografías del Local o Banco de Trabajo</label>
                    <div className="border-2 border-slate-300 border-dashed rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                      <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 mb-2"></i>
                      <p className="text-xs text-slate-600 font-medium">Haz clic para subir fotos o arrastra y suelta</p>
                      <span className="text-[11px] text-slate-400">PNG o JPG hasta 10MB</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold text-sm py-4 rounded-xl hover:bg-slate-800 transition shadow-lg mt-4 disabled:opacity-50"
                >
                  {loading ? 'Guardando en Supabase...' : 'Enviar Solicitud de Registro'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Estado Exitoso tras guardar en Supabase */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Taller Registrado en Supabase!</h2>
            <p className="text-slate-500 text-sm mb-6">
              El taller <strong>{formData.nombre}</strong> (ID: {formData.id_usuario}) ha sido guardado exitosamente en la base de datos y está listo para ser validado por el administrador.
            </p>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin')} className="w-full bg-teal-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-teal-700 transition">
                Ir al Panel Admin para Validar
              </button>
              <button onClick={() => setRegistrado(false)} className="w-full text-slate-500 text-xs py-2 hover:underline">
                Registrar otro taller
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}