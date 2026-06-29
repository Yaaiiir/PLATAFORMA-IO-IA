import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Brain, ArrowLeft, X, Send, Bot, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ioApi } from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Panel de ejemplo de respaldo cuando Ollama no responde (Método Simplex)
// ─────────────────────────────────────────────────────────────────────────────
const FallbackExample = () => {
  const [expandedStep, setExpandedStep] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Planteamiento del Modelo e Inserción de Variables de Holgura',
      color: 'blue',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
          <p>Consideremos un problema clásico de maximización. Para aplicar el <span className="text-emerald-400 font-semibold">Método Simplex</span>, convertimos las inecuaciones en igualdades añadiendo <span className="text-blue-400 font-semibold">variables de holgura (sₙ)</span>:</p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono space-y-1 text-[11px]">
            <p className="text-yellow-400 font-bold">Maximizar: Z - 3x₁ - 2x₂ = 0</p>
            <p className="text-slate-400 mt-2">Sujeto a:</p>
            <p className="text-purple-300">  2x₁ +  x₂ + s₁     = 18  (Restricción de Materia Prima)</p>
            <p className="text-pink-300">   x₁ + 3x₂      + s₂ = 24  (Restricción de Mano de Obra)</p>
            <p className="text-slate-400">   x₁, x₂, s₁, s₂ ≥ 0</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Construcción del Tableau Inicial (Matriz Simplex)',
      color: 'purple',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Vaciamos los coeficientes técnicos en la tabla simplex inicial identificando las columnas y la solución básica actual:</p>
          <div className="bg-slate-900 border border-purple-900/40 rounded-lg overflow-hidden text-[11px] font-mono">
            <div className="grid grid-cols-6 bg-slate-800/60 px-2 py-1 text-slate-400 font-bold text-[10px] uppercase text-center">
              <span>Base</span><span>x₁</span><span>x₂</span><span>s₁</span><span>s₂</span><span>RHS</span>
            </div>
            <div className="grid grid-cols-6 px-2 py-1 border-t border-slate-800 text-center text-purple-300">
              <span className="font-bold text-slate-400">s₁</span><span>2</span><span>1</span><span>1</span><span>0</span><span>18</span>
            </div>
            <div className="grid grid-cols-6 px-2 py-1 border-t border-slate-800 text-center text-pink-300">
              <span className="font-bold text-slate-400">s₂</span><span>1</span><span>3</span><span>0</span><span>1</span><span>24</span>
            </div>
            <div className="grid grid-cols-6 px-2 py-1 border-t border-slate-700 text-center bg-slate-950 text-yellow-400 font-bold">
              <span>Z</span><span>-3</span><span>-2</span><span>0</span><span>0</span><span>0</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Criterio de Entrada (Columna Pivote) y Salida (Fila Pivote)',
      color: 'green',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Buscamos mejorar el valor de Z bajo las reglas del Simplex:</p>
          <div className="bg-slate-900 border border-green-900/40 rounded-lg p-3 text-[11px] space-y-2">
            <p className="text-slate-400"><span className="text-green-400 font-semibold">1. Variable que entra:</span> Elegimos el valor más negativo en la fila Z. En este caso, <span className="text-white font-bold">-3</span> correspondiente a <span className="text-emerald-400">x₁</span>.</p>
            <p className="text-slate-400"><span className="text-green-400 font-semibold">2. Variable que sale (Prueba de la razón):</span> Dividimos el RHS entre los coeficientes de la columna pivote:</p>
            <div className="space-y-0.5 pl-2 font-mono text-green-300">
              <p>Fila s₁: 18 / 2 = 9  ← Razón Mínima</p>
              <p>Fila s₂: 24 / 1 = 24</p>
            </div>
            <p className="text-slate-400 mt-2">El pivote es <span className="text-white font-bold bg-emerald-600 px-1 rounded">2</span>. La variable <span className="text-purple-300">s₁</span> sale de la base y entra <span className="text-emerald-400">x₁</span>.</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Operaciones de Gauss-Jordan (Iteración del Algoritmo)',
      color: 'yellow',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Hacemos el pivote igual a 1 dividiendo la Fila 1 entre 2, y luego eliminamos los coeficientes de la columna x₁ en las demás filas:</p>
          <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3 font-mono text-[11px] space-y-1">
            <p className="text-slate-400">Nueva Fila Pivote (x₁): [1, 0.5, 0.5, 0, 9]</p>
            <p className="text-slate-400">Nueva Fila s₂ (F₂ - F₁_nueva): [0, 2.5, -0.5, 1, 15]</p>
            <p className="text-yellow-400 font-bold">Nueva Fila Z (Z + 3*F₁_nueva): [0, -0.5, 1.5, 0, 27]</p>
          </div>
          <p className="text-slate-400 text-[11px]">Como aún queda un valor negativo en Z (-0.5), se realizaría una iteración adicional introduciendo x₂.</p>
        </div>
      )
    },
    {
      id: 5,
      title: 'Solución Óptima Final e Interpretación',
      color: 'amber',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Solución Óptima Teórica</p>
            <p className="text-2xl font-black font-mono text-emerald-400">Z* = 30</p>
            <p className="text-sm font-mono text-slate-300 mt-1">en las coordenadas (x₁ = 6, x₂ = 6)</p>
          </div>
          <div className="space-y-2 text-[11px] text-slate-400">
            <p><span className="text-white font-semibold">Análisis de Sensibilidad:</span> Si una variable de holgura final finaliza con valor mayor que 0, indica holgura o recurso sobrante. Si es 0, el recurso es escaso y limita la operación.</p>
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
    amber:  { border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
  };

  return (
    <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-4 mt-6">
      <div className="flex items-start gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="p-2 bg-amber-500/10 rounded-lg shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
            Guía de Interpretación: El Algoritmo Simplex Paso a Paso
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono tracking-wider">MODO OFFLINE</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            El servicio de IA local no está disponible. Usa esta metodología analítica estructural para desglosar tus variables básicas y holguras.
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
                    Paso {step.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
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
// COMPONENTE PRINCIPAL: SimplexSolver
// ─────────────────────────────────────────────────────────────────────────────
export default function SimplexSolver({ onBack }) {
  const [objectiveType, setObjectiveType] = useState('MAX');
  const [numVariables, setNumVariables] = useState(2);
  const [objectiveCoefficients, setObjectiveCoefficients] = useState(['', '']);
  const [constraints, setConstraints] = useState([{ coefficients: ['', ''], sign: '<=', rhs: '' }]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- Estados para el Chat Flotante ---
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu asistente de IO. ¿Tienes alguna duda con la configuración de tu matriz o las restricciones del Método Simplex?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const hasAiAnalysis = result?.analysis && typeof result.analysis === 'string' && result.analysis.trim().length > 10;

  const handleObjChange = (index, value) => {
    const updated = [...objectiveCoefficients];
    updated[index] = value;
    setObjectiveCoefficients(updated);
  };

  const handleConstraintCoefChange = (cIndex, vIndex, value) => {
    const updated = [...constraints];
    updated[cIndex].coefficients[vIndex] = value;
    setConstraints(updated);
  };

  const handleConstraintMetaChange = (index, field, value) => {
    const updated = [...constraints];
    updated[index][field] = value;
    setConstraints(updated);
  };

  const adjustVariables = (newNum) => {
    if (newNum < 1 || newNum > 10) return;
    setNumVariables(newNum);
    
    const newObj = [...objectiveCoefficients];
    if (newNum > newObj.length) {
      while (newObj.length < newNum) newObj.push('');
    } else {
      newObj.length = newNum;
    }
    setObjectiveCoefficients(newObj);

    const newConstraints = constraints.map(c => {
      const coefs = [...c.coefficients];
      if (newNum > coefs.length) {
        while (coefs.length < newNum) coefs.push('');
      } else {
        coefs.length = newNum;
      }
      return { ...c, coefficients: coefs };
    });
    setConstraints(newConstraints);
  };

  const addConstraint = () => {
    const emptyCoefs = Array(numVariables).fill('');
    setConstraints([...constraints, { coefficients: emptyCoefs, sign: '<=', rhs: '' }]);
  };

  const removeConstraint = (index) => {
    if (constraints.length === 1) return;
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      objective_type: objectiveType,
      objective_coefficients: objectiveCoefficients.map(val => parseFloat(val) || 0),
      constraints: constraints.map(c => ({
        coefficients: c.coefficients.map(val => parseFloat(val) || 0),
        sign: c.sign,
        rhs: parseFloat(c.rhs) || 0
      }))
    };

    const res = await ioApi.solveSimplex(payload);
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message || "Error inesperado al resolver el problema.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/asistente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context_data: result ? result.data : {}
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
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12 relative selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2 mb-2">
            <Calculator className="w-6 h-6 text-emerald-400" /> Configuración del Modelo Simplex
          </h2>
          <p className="text-sm text-slate-400 border-b border-slate-800 pb-4 mb-6">
            Ingresa las variables de decisión y restricciones. La plataforma procesará el Tableau e interpretará la solución de negocio.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Optimización y Variables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tipo de Optimización</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setObjectiveType('MAX')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${objectiveType === 'MAX' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Maximizar (MAX)
                  </button>
                  <button
                    type="button"
                    onClick={() => setObjectiveType('MIN')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${objectiveType === 'MIN' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                  >
                    Minimizar (MIN)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cantidad de Variables</label>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <button 
                    type="button" 
                    onClick={() => adjustVariables(numVariables - 1)}
                    className="w-10 py-1 bg-slate-950 rounded text-lg font-bold hover:text-red-400 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono font-bold text-slate-200">{numVariables} Variables</span>
                  <button 
                    type="button" 
                    onClick={() => adjustVariables(numVariables + 1)}
                    className="w-10 py-1 bg-slate-950 rounded text-lg font-bold hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Función Objetivo */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Función Objetivo (Z)</label>
              <div className="flex flex-wrap items-center gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                <span className="text-sm font-mono font-bold text-slate-400">Z =</span>
                {objectiveCoefficients.map((coef, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={coef}
                      required
                      onChange={(e) => handleObjChange(idx, e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm text-center focus:outline-none focus:border-emerald-500 text-white"
                    />
                    <span className="text-sm font-bold text-slate-300">
                      x<sub>{idx + 1}</sub>
                      {idx < numVariables - 1 ? ' +' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricciones */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Restricciones del Sistema</label>
                <button
                  type="button"
                  onClick={addConstraint}
                  className="flex items-center gap-1 text-xs bg-slate-900 border border-slate-800 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg text-emerald-400 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir Restricción
                </button>
              </div>

              <div className="space-y-3">
                {constraints.map((constraint, cIdx) => (
                  <div key={cIdx} className="flex flex-wrap items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 group">
                    <span className="text-xs font-mono font-bold text-slate-500">R{cIdx + 1}:</span>
                    {constraint.coefficients.map((coef, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={coef}
                          required
                          onChange={(e) => handleConstraintCoefChange(cIdx, vIdx, e.target.value)}
                          className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm text-center focus:outline-none focus:border-emerald-500 text-white"
                        />
                        <span className="text-sm font-bold text-slate-400">
                          x<sub>{vIdx + 1}</sub>
                          {vIdx < numVariables - 1 ? ' +' : ''}
                        </span>
                      </div>
                    ))}

                    <select
                      value={constraint.sign}
                      onChange={(e) => handleConstraintMetaChange(cIdx, 'sign', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="<=">&le;</option>
                      <option value=">=">&ge;</option>
                      <option value="=">=</option>
                    </select>

                    <input
                      type="number"
                      step="any"
                      placeholder="RHS"
                      value={constraint.rhs}
                      required
                      onChange={(e) => handleConstraintMetaChange(cIdx, 'rhs', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm text-center focus:outline-none focus:border-emerald-500 text-white"
                    />

                    <button
                      type="button"
                      disabled={constraints.length === 1}
                      onClick={() => removeConstraint(cIdx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 ml-auto transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? 'Calculando con el motor e IA...' : 'Calcular Solución Óptima'}
            </button>
          </form>

          {/* Renderizado de Errores & Fallback por falla de conexión/servidor */}
          {error && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-sm text-red-400 font-medium">
                {error}
              </div>
              <FallbackExample />
            </div>
          )}

          {/* Renderizado Analítico cuando la API responde */}
          {result && (
            <div className="mt-8 space-y-6 border-t border-slate-800 pt-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-200">Resultados Analíticos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Óptimo (Z)</span>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                    {result.data?.objective_value !== undefined && result.data.objective_value !== null ? result.data.objective_value : 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asignación de Variables</span>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-sm">
                    {result.data?.variables && Object.entries(result.data.variables).map(([name, val]) => (
                      <div key={name} className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800/40 flex justify-between">
                        <span className="text-slate-400 font-bold">{name}:</span>
                        <span className="text-slate-200 font-black">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Si vino análisis se muestra, sino, se renderiza el Fallback */}
              {hasAiAnalysis ? (
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/10 rounded-xl p-5 shadow-inner">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
                    <Brain className="w-4 h-4 text-emerald-400" /> Interpretación del Consultor de IA
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {result.analysis}
                  </p>
                </div>
              ) : (
                <FallbackExample />
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPONENTE INTERACTIVO: CHAT FLOTANTE DE IA               */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isOpen && (
          <div className="w-[350px] sm:w-[400px] h-[500px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 flex flex-col mb-4 overflow-hidden backdrop-blur-lg animate-fadeIn">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Asistente Simplex</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ollama Activo
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-emerald-500 to-blue-600 text-slate-950 font-bold rounded-tr-none shadow-md shadow-emerald-500/5' 
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none p-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider text-emerald-500/80">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre holguras, dualidad..."
                disabled={chatLoading}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="p-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-slate-950 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md shadow-emerald-950/55 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-600 text-slate-950`}
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}