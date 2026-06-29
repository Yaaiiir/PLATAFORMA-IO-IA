import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Truck, Brain, ArrowLeft, RefreshCw, MessageSquare, X, Send, Bot, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ioApi } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Panel de ejemplo de respaldo cuando Ollama no responde (Transporte)
// ─────────────────────────────────────────────────────────────────────────────
const FallbackTransportExample = () => {
  const [expandedStep, setExpandedStep] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Planteamiento de la Matriz y Balanceo',
      color: 'blue',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
          <p>Antes de aplicar cualquier algoritmo, se construye la matriz con la <span className="text-blue-400 font-semibold">Oferta</span> y la <span className="text-blue-400 font-semibold">Demanda</span>. Es vital verificar el balanceo:</p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono space-y-1 text-[11px]">
            <p className="text-yellow-400 font-bold">∑ Oferta (Capacidad) = ∑ Demanda (Requerido)</p>
            <p className="text-slate-400 mt-2">Si no están balanceadas:</p>
            <p className="text-purple-300">  • Oferta &gt; Demanda: Se añade un Destino Ficticio con costo $0.</p>
            <p className="text-pink-300">  • Demanda &gt; Oferta: Se añade un Origen Ficticio con costo $0.</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Método de la Esquina Noroeste (NRE)',
      color: 'purple',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Un método puramente heurístico y mecánico que no considera los costos de transporte:</p>
          <div className="bg-slate-900 border border-purple-900/40 rounded-lg p-3 space-y-1 text-[11px]">
            <p className="text-purple-300 font-bold">Procedimiento:</p>
            <p>1. Empieza en la celda superior izquierda <span className="text-white">(Noroeste)</span>.</p>
            <p>2. Asigna el máximo posible entre la Oferta y Demanda de esa fila/columna.</p>
            <p>3. Resta la cantidad asignada y tacha la fila o columna satisfecha (0).</p>
            <p>4. Desplázate a la derecha o hacia abajo y repite hasta agotar los recursos.</p>
          </div>
          <p className="text-slate-400 text-[11px]">💡 *Desventaja:* Suele arrojar un costo total muy elevado porque ignora las tarifas de envío.</p>
        </div>
      )
    },
    {
      id: 3,
      title: 'Método del Costo Mínimo (MCM)',
      color: 'green',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Mejora los resultados enfocándose en las <span className="text-green-400 font-semibold">tarifas de transporte más baratas</span>:</p>
          <div className="bg-slate-900 border border-green-900/40 rounded-lg p-3 text-[11px] space-y-1">
            <p className="text-green-300 font-bold">Procedimiento:</p>
            <p>1. Identifica la celda con el <span className="text-white">costo unitario más bajo</span> de toda la matriz.</p>
            <p>2. Asigna la mayor cantidad posible de unidades a esa celda.</p>
            <p>3. Cruza la fila o columna satisfecha y actualiza los saldos restantes.</p>
            <p>4. Busca el siguiente costo más bajo entre las celdas no tachadas y repite.</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Aproximación de Vogel (VOGEL) y Penalizaciones',
      color: 'yellow',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Es el algoritmo más robusto porque calcula el <span className="text-yellow-400 font-semibold">costo de oportunidad</span> mediante penalizaciones:</p>
          <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3 text-[11px] space-y-1.5">
            <p className="text-yellow-300 font-bold">¿Cómo calcular penalizaciones?</p>
            <p className="text-slate-400">Resta los <span className="text-white">dos costos más bajos</span> de cada fila y de cada columna de manera independiente.</p>
            <p className="text-yellow-400 font-bold mt-2">Regla de Asignación:</p>
            <p>1. Selecciona la fila o columna con la <span className="text-amber-400 font-semibold">penalización más alta</span>.</p>
            <p>2. En esa fila/columna, ubica la celda con el <span className="text-white">menor costo</span> y dale la máxima prioridad de asignación.</p>
            <p>3. Satisface la oferta o demanda, elimina la línea correspondiente y vuelve a recalcular penalizaciones.</p>
          </div>
          <p className="text-slate-400 text-[11px]">Normalmente produce la mejor solución inicial, idéntica o muy cercana al óptimo global.</p>
        </div>
      )
    },
    {
      id: 5,
      title: 'Cálculo del Costo Total de Distribución',
      color: 'orange',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Una vez completadas todas las asignaciones, el costo total del plan logístico se calcula multiplicando cada cantidad asignada por su costo de envío correspondiente:</p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-center">
            <p className="text-orange-400 font-bold">Z = ∑ (Cantidad Asignada × Costo Unitario)</p>
            <p className="text-slate-400 text-left mt-2 text-[10px]">Ejemplo: Si envías 50 unidades por una ruta que cobra $4 y 30 unidades por una de $2:</p>
            <p className="text-white text-left font-bold pl-2">Z = (50 × 4) + (30 × 2) = 200 + 60 = $260 MXN</p>
          </div>
        </div>
      )
    }
  ];

  const colorMap = {
    blue:   { border: 'border-blue-500/30',   badge: 'bg-blue-500/20 text-blue-300' },
    purple: { border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300' },
    green:  { border: 'border-green-500/30',  badge: 'bg-green-500/20 text-green-300' },
    yellow: { border: 'border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-300' },
    orange: { border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300' },
  };

  return (
    <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-4 mt-6">
      <div className="flex items-start gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            Guía de Estudio: Modelos de Redes de Transporte Logístico
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono tracking-wider">SOPORTE ACADÉMICO</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Analiza los fundamentos técnicos de los tres algoritmos clásicos de transporte para interpretar adecuadamente tu matriz de distribución.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const colors = colorMap[step.color];
          const isOpen = expandedStep === step.id;
          return (
            <div key={step.id} className={`border rounded-xl overflow-hidden transition-all duration-200 ${colors.border}`}>
              <button
                type="button"
                onClick={() => setExpandedStep(isOpen ? null : step.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-950/60 hover:bg-slate-950/90 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                    Fase {step.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-4 py-3 bg-slate-950/30 border-t border-slate-800/60">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
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

  // --- Estados para el Chat Flotante ---
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu asistente de IO. ¿Tienes alguna duda sobre este Modelo de Transporte o sobre los métodos de solución como Vogel?' }
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const chatEndRef = useRef(null);

  // Determinar si el análisis extendido de IA está presente
  const hasAiAnalysis = result?.analysis && typeof result.analysis === 'string' && result.analysis.trim().length > 10;

  // Auto scroll del chat al recibir mensajes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingChat, isOpen]);

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

    const payload = {
      origins_names: origins,
      destinations_names: destinations,
      costs_matrix: costs.map(row => row.map(val => parseFloat(val) || 0)),
      supply: supply.map(val => parseFloat(val) || 0),
      demand: demand.map(val => parseFloat(val) || 0),
      method: method
    };

    const res = await ioApi.solveTransport(payload);
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message || "Error al resolver la distribución de transporte.");
    }
  };

  // --- Función para enviar mensajes a Ollama ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoadingChat) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setIsLoadingChat(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/asistente/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context_data: { 
            modulo: 'transporte',
            algoritmo: method,
            matriz_actual: { costs, supply, demand, origins, destinations },
            resultado_actual: result ? result.data : null
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'bot', text: data.response }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'bot', text: 'Error al procesar la respuesta del servidor.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now(), sender: 'bot', text: 'No se pudo conectar con el servidor local de IA.' }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12 relative selection:bg-amber-500 selection:text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Botón de regreso */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="grid grid-cols-1 gap-6">
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
                {hasAiAnalysis ? (
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/10 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-purple-400 flex items-center gap-1.5 mb-3">
                      <Brain className="w-4 h-4" /> Análisis Logístico con IA 
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {result.analysis}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-red-500/10 rounded-xl p-5 text-sm text-slate-400">
                    ⚠️ El análisis avanzado de IA no regresó una interpretación válida de los costos. Revisa la guía interactiva inferior.
                  </div>
                )}
              </div>
            )}

            {/* Panel Acordeón de Guía/Soporte Educativo */}
            <FallbackTransportExample />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPONENTE INTERACTIVO: CHAT FLOTANTE DE IA (INTEGRADO)   */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Ventana de Conversación Abierta */}
        {isOpen && (
          <div className="w-[350px] sm:w-[400px] h-[500px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col mb-4 overflow-hidden backdrop-blur-md">
            
            {/* Header del Chat */}
            <div className="p-4 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Asistente de Optimización</h4>
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Ollama Activo
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Caja de Mensajes */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold rounded-tr-none shadow-md' 
                      : 'bg-slate-950 border border-slate-800/80 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Efecto de carga / procesando tokens */}
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none p-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider text-slate-500">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800/60 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre Simplex, Vogel..."
                disabled={isLoadingChat}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoadingChat}
                className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Botón Flotante Principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isOpen 
              ? 'bg-slate-800 border border-slate-700 text-slate-300 rotate-90' 
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:shadow-amber-500/20'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>

      </div>
    </div>
  );
}