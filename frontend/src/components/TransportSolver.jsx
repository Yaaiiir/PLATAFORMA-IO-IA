import React, { useState } from 'react';
import { Plus, Trash2, Truck, Brain, ArrowLeft, RefreshCw } from 'lucide-react';
import { ioApi } from '../services/api';

export default function TransportSolver({ onBack }) {
  // Configuración de dimensiones de la matriz
  const [origins, setOrigins] = useState(['Origen A', 'Origen B']);
  const [destinations, setDestinations] = useState(['Destino 1', 'Destino 2', 'Destino 3']);
  
  // Selector de algoritmo
  const [method, setMethod] = useState('VOGEL'); // NRE (Noroeste), MCM (Costo Mínimo), VOGEL

  // Datos numéricos: Matriz de costos (Filas: Orígenes, Columnas: Destinos)
  const [costs, setCosts] = useState([
    ['', '', ''],
    ['', '', '']
  ]);
  const [supply, setSupply] = useState(['', '']); // Oferta por Origen
  const [demand, setDemand] = useState(['', '', '']); // Demanda por Destino

  // Estados de control de la API
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Manejar cambios en la matriz de costos
  const handleCostChange = (oIdx, dIdx, value) => {
    const updated = costs.map((row, rIdx) => 
      rIdx === oIdx ? row.map((cell, cIdx) => cIdx === dIdx ? value : cell) : row
    );
    setCosts(updated);
  };

  // Añadir un nuevo punto de Origen (Fila)
  const addOrigin = () => {
    const name = `Origen ${String.fromCharCode(65 + origins.length)}`;
    setOrigins([...origins, name]);
    setSupply([...supply, '']);
    setCosts([...costs, Array(destinations.length).fill('')]);
  };

  // Eliminar un Origen
  const removeOrigin = (index) => {
    if (origins.length <= 1) return;
    setOrigins(origins.filter((_, i) => i !== index));
    setSupply(supply.filter((_, i) => i !== index));
    setCosts(costs.filter((_, i) => i !== index));
  };

  // Añadir un nuevo punto de Destino (Columna)
  const addDestination = () => {
    const name = `Destino ${destinations.length + 1}`;
    setDestinations([...destinations, name]);
    setDemand([...demand, '']);
    setCosts(costs.map(row => [...row, '']));
  };

  // Eliminar un Destino
  const removeDestination = (index) => {
    if (destinations.length <= 1) return;
    setDestinations(destinations.filter((_, i) => i !== index));
    setDemand(demand.filter((_, i) => i !== index));
    setCosts(costs.map(row => row.filter((_, i) => i !== index)));
  };

  // Enviar modelo al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Formatear datos estructurando floats para la API
    const payload = {
      origins_names: origins,
      destinations_names: destinations,
      costs_matrix: costs.map(row => row.map(val => parseFloat(val) || 0)),
      supply: supply.map(val => parseFloat(val) || 0),
      demand: demand.map(val => parseFloat(val) || 0),
      method: method // Enviamos el método seleccionado
    };

    const res = await ioApi.solveTransport(payload);
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message || "Error al resolver la distribución de transporte.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Botón de regreso */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2 mb-2">
            <Truck className="w-6 h-6 text-amber-400" /> Modelo de Transporte y Distribución
          </h2>
          <p className="text-sm text-slate-400 border-b border-slate-800 pb-4 mb-6">
            Configura la matriz de costos logísticos, capacidades de oferta y requerimientos de demanda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Controles de Algoritmo y Dimensiones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Criterio / Algoritmo de Solución</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="VOGEL">Método de Aproximación de Vogel (Óptimo Cercano)</option>
                  <option value="MCM">Método del Costo Mínimo</option>
                  <option value="NRE">Método de la Esquina Noroeste</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="button" onClick={addOrigin}
                  className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  + Añadir Origen
                </button>
                <button
                  type="button" onClick={addDestination}
                  className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-lg text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  + Añadir Destino
                </button>
              </div>
            </div>

            {/* MATRIZ DINÁMICA DE COSTOS */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40 p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-semibold text-slate-500 uppercase font-mono">Orígenes \ Destinos</th>
                    {destinations.map((dest, dIdx) => (
                      <th key={dIdx} className="p-2 text-center text-xs font-semibold text-slate-400 font-mono">
                        <div className="flex flex-col items-center gap-1">
                          <span>{dest}</span>
                          <button 
                            type="button" disabled={destinations.length === 1} onClick={() => removeDestination(dIdx)}
                            className="text-[10px] text-red-500 opacity-60 hover:opacity-100 disabled:opacity-0"
                          >
                            Eliminar
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="p-2 text-center text-xs font-semibold text-amber-400 uppercase font-mono">Oferta</th>
                  </tr>
                </thead>
                <tbody>
                  {origins.map((orig, oIdx) => (
                    <tr key={oIdx} className="border-t border-slate-800/60 group">
                      <td className="p-2 font-medium text-sm text-slate-300 flex flex-col justify-center">
                        <span className="font-bold">{orig}</span>
                        <button 
                          type="button" disabled={origins.length === 1} onClick={() => removeOrigin(oIdx)}
                          className="text-[10px] text-red-500 opacity-0 group-hover:opacity-60 text-left hover:!opacity-100 disabled:opacity-0 transition-opacity"
                        >
                          Eliminar row
                        </button>
                      </td>
                      
                      {destinations.map((_, dIdx) => (
                        <td key={dIdx} className="p-2 text-center">
                          <input
                            type="number" placeholder="Costo" value={costs[oIdx]?.[dIdx] || ''} required
                            onChange={(e) => handleCostChange(oIdx, dIdx, e.target.value)}
                            className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 font-mono text-xs text-center text-white focus:border-amber-500 focus:outline-none"
                          />
                        </td>
                      ))}

                      {/* Input de Oferta por fila */}
                      <td className="p-2 text-center">
                        <input
                          type="number" placeholder="Capacidad" value={supply[oIdx] || ''} required
                          onChange={(e) => {
                            const updated = [...supply]; updated[oIdx] = e.target.value; setSupply(updated);
                          }}
                          className="w-24 bg-slate-900/60 border border-amber-500/30 rounded px-2 py-1.5 font-mono text-xs text-center text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                  
                  {/* Fila de Demanda en la parte inferior */}
                  <tr className="border-t-2 border-slate-800">
                    <td className="p-2 text-xs font-bold text-amber-400 uppercase font-mono">Demanda</td>
                    {destinations.map((_, dIdx) => (
                      <td key={dIdx} className="p-2 text-center">
                        <input
                          type="number" placeholder="Requerido" value={demand[dIdx] || ''} required
                          onChange={(e) => {
                            const updated = [...demand]; updated[dIdx] = e.target.value; setDemand(updated);
                          }}
                          className="w-20 bg-slate-900/60 border border-amber-500/30 rounded px-2 py-1.5 font-mono text-xs text-center text-amber-300 font-bold focus:border-amber-500 focus:outline-none"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center font-mono text-xs text-slate-500 font-bold">∑ Matriz</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {loading ? 'Calculando Rutas de Distribución...' : 'Optimizar Red de Transporte'}
            </button>
          </form>

          {error && <div className="mt-6 p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-sm text-red-400">{error}</div>}

          {/* MATRIZ DE RESULTADOS / ASIGNACIÓN ÓPTIMA */}
          {result && (
            <div className="mt-8 space-y-6 border-t border-slate-800 pt-6">
              <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                Rutas Logísticas Asignadas
              </h3>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 w-fit">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Costo Total de Distribución</span>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  ${result.data.total_cost !== null ? result.data.total_cost.toLocaleString() : 'N/A'} MXN
                </div>
              </div>

              {/* Matriz Visual Resultante */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900 p-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs font-semibold text-slate-500 uppercase font-mono">Origen \ Destino</th>
                      {destinations.map((dest, i) => (
                        <th key={i} className="p-2 text-center text-xs font-bold text-slate-300 font-mono">{dest}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {origins.map((orig, oIdx) => (
                      <tr key={oIdx} className="border-t border-slate-800/60">
                        <td className="p-2 font-bold text-sm text-slate-400">{orig}</td>
                        {destinations.map((_, dIdx) => {
                          const quantity = result.data.allocation[oIdx]?.[dIdx] || 0;
                          return (
                            <td key={dIdx} className="p-2 text-center">
                              <div className={`p-2 rounded-lg font-mono text-sm ${quantity > 0 ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold' : 'bg-slate-950 text-slate-600 border border-slate-900'}`}>
                                {quantity > 0 ? `${quantity} uds` : '0'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contenedor de Interpretación de IA */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/10 rounded-xl p-5">
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-1.5 mb-3">
                  <Brain className="w-4 h-4" /> Análisis Logístico con IA 
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {result.analysis}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}