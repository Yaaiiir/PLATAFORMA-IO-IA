import React from 'react';
import { Layers, BarChart2, Truck, Brain, Activity } from 'lucide-react';

export default function Home({ setModule }) {
  // Configuración de las tarjetas del menú basadas en tus 3 módulos clave
  const modules = [
    {
      id: 'simplex',
      title: 'Método Simplex',
      description: 'Optimización lineal multidimensional para "n" variables de decisión y restricciones mediante matrices iterativas.',
      icon: <Layers className="w-8 h-8 text-emerald-400" />,
      color: 'border-emerald-500/20 hover:border-emerald-500/50'
    },
    {
      id: 'graphic',
      title: 'Método Gráfico',
      description: 'Visualización geométrica del espacio de soluciones y polígonos convexos acotados para modelos de 2 variables.',
      icon: <BarChart2 className="w-8 h-8 text-blue-400" />,
      color: 'border-blue-500/20 hover:border-blue-500/50'
    },
    {
      id: 'transport',
      title: 'Modelo de Transporte',
      description: 'Optimización de redes de distribución y cadenas logísticas minimizando costos entre ofertas y demandas.',
      icon: <Truck className="w-8 h-8 text-amber-400" />,
      color: 'border-amber-500/20 hover:border-amber-500/50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans p-6 md:p-12 selection:bg-emerald-500 selection:text-black">
      {/* Encabezado del Dashboard */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Plataforma Web Interactiva de IO
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Sistemas de Información & Ingeniería Industrial con Soporte de Inteligencia Artificial Local
          </p>
        </div>
        
        {/* Badge de estado del Backend / Telemetría */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs w-fit">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-mono">Telemetría Core Activa</span>
        </div>
      </header>

      {/* Grid de Módulos Operacionales */}
      <main className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-300">
            <Brain className="w-5 h-5 text-purple-400" /> Selecciona un Módulo de Optimización
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setModule(mod.id)}
              className={`flex flex-col text-left p-6 bg-slate-900/60 backdrop-blur-md border ${mod.color} rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/50 group cursor-pointer`}
            >
              <div className="p-3 bg-slate-950 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {mod.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                {mod.title}
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed flex-grow">
                {mod.description}
              </p>
              <div className="mt-4 text-xs font-semibold text-slate-500 group-hover:text-slate-300 flex items-center gap-1 transition-colors">
                Iniciar Solucionador &rarr;
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}