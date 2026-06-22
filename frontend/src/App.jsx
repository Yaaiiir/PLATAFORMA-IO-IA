import React, { useState } from 'react';
import Home from './pages/Home';
import SimplexSolver from './components/SimplexSolver';
import GraphicSolver from './components/GraphicSolver';
import TransportSolver from './components/TransportSolver';

export default function App() {
  // Estado para controlar en qué pantalla/módulo se encuentra el usuario
  const [currentModule, setCurrentModule] = useState('home');

  return (
    <>
      {/* 1. Dashboard Principal */}
      {currentModule === 'home' && (
        <Home setModule={setCurrentModule} />
      )}

      {/* 2. Módulo de Optimización Simplex de n Variables */}
      {currentModule === 'simplex' && (
        <SimplexSolver onBack={() => setCurrentModule('home')} />
      )}

      {/* 3. Módulo del Método Gráfico de 2 Variables */}
      {currentModule === 'graphic' && (
        <GraphicSolver onBack={() => setCurrentModule('home')} />
      )}

      {/* 4. Módulo del Modelo de Distribución de Transporte */}
      {currentModule === 'transport' && (
        <TransportSolver onBack={() => setCurrentModule('home')} />
      )}
    </>
  );
}