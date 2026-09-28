import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UserHome from './pages/UserHome';
import TechRegister from './pages/TechRegister';
import TechDashboard from './pages/TechDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", system-ui, sans-serif' }}>
        <Routes>
          {/* Portal Público e Inicio de Sesión */}
          <Route path="/" element={<Home />} />
          
          {/* Interfaces Separadas */}
          <Route path="/usuario" element={<UserHome />} />
          <Route path="/tech/registro" element={<TechRegister />} />
          <Route path="/tech/dashboard" element={<TechDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}