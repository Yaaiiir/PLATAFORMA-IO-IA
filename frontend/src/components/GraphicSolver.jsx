import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, BarChart2, Brain, ArrowLeft, MessageSquare, X, Send, Bot, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { ioApi } from '../services/api';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Polygon, ReferenceDot, ReferenceLine } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE: Panel de ejemplo de respaldo cuando Ollama no responde
// ─────────────────────────────────────────────────────────────────────────────
const FallbackExample = () => {
  const [expandedStep, setExpandedStep] = useState(null);

  const steps = [
    {
      id: 1,
      title: 'Planteamiento del Problema',
      color: 'blue',
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
          <p>Consideremos el siguiente <span className="text-blue-400 font-semibold">Problema de Programación Lineal</span> de ejemplo:</p>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono space-y-1 text-[11px]">
            <p className="text-yellow-400 font-bold">Maximizar:  Z = 5x₁ + 4x₂</p>
            <p className="text-slate-400 mt-2">Sujeto a:</p>
            <p className="text-purple-300">  6x₁ + 4x₂ ≤ 24   (R1: Restricción de Recursos A)</p>
            <p className="text-pink-300">   x₁ + 2x₂ ≤ 6    (R2: Restricción de Recursos B)</p>
            <p className="text-slate-400">   x₁, x₂ ≥ 0      (No negatividad)</p>
          </div>
          <p className="text-slate-400 text-[11px]">Objetivo: Encontrar los valores de x₁ y x₂ que maximicen Z respetando todas las restricciones.</p>
        </div>
      )
    },
    {
      id: 2,
      title: 'Graficar las Líneas Límite',
      color: 'purple',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Convertimos cada restricción en <span className="text-purple-400 font-semibold">igualdad</span> y encontramos sus intersecciones con los ejes:</p>

          <div className="bg-slate-900 border border-purple-900/40 rounded-lg p-3 space-y-2 text-[11px]">
            <p className="text-purple-300 font-bold">R1: 6x₁ + 4x₂ = 24</p>
            <div className="pl-3 space-y-1 text-slate-400">
              <p>→ Si x₁ = 0:  4x₂ = 24  →  <span className="text-white">x₂ = 6</span>   → Punto: <span className="text-purple-300">(0, 6)</span></p>
              <p>→ Si x₂ = 0:  6x₁ = 24  →  <span className="text-white">x₁ = 4</span>   → Punto: <span className="text-purple-300">(4, 0)</span></p>
            </div>
          </div>

          <div className="bg-slate-900 border border-pink-900/40 rounded-lg p-3 space-y-2 text-[11px]">
            <p className="text-pink-300 font-bold">R2: x₁ + 2x₂ = 6</p>
            <div className="pl-3 space-y-1 text-slate-400">
              <p>→ Si x₁ = 0:  2x₂ = 6  →  <span className="text-white">x₂ = 3</span>   → Punto: <span className="text-pink-300">(0, 3)</span></p>
              <p>→ Si x₂ = 0:   x₁ = 6  →  <span className="text-white">x₁ = 6</span>   → Punto: <span className="text-pink-300">(6, 0)</span></p>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">Trazamos ambas líneas en el plano cartesiano uniendo sus puntos de intersección con los ejes.</p>
        </div>
      )
    },
    {
      id: 3,
      title: 'Identificar la Región Factible',
      color: 'green',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>La <span className="text-green-400 font-semibold">región factible</span> es el conjunto de todos los puntos que satisfacen <em>simultáneamente</em> todas las restricciones.</p>
          <div className="bg-slate-900 border border-green-900/40 rounded-lg p-3 text-[11px] space-y-2">
            <p className="text-slate-400">Para verificar qué lado de cada línea incluir, sustituimos el <span className="text-white">origen (0,0)</span>:</p>
            <div className="space-y-1 pl-2">
              <p className="text-green-300">R1: 6(0) + 4(0) = 0 ≤ 24 ✓  → El origen <em>sí</em> cumple R1</p>
              <p className="text-green-300">R2: (0) + 2(0) = 0 ≤ 6  ✓  → El origen <em>sí</em> cumple R2</p>
            </div>
            <p className="text-slate-400 mt-2">Por lo tanto, la región factible está del lado del origen, formando un <span className="text-green-400 font-semibold">polígono convexo</span> acotado.</p>
          </div>
          <p className="text-slate-400 text-[11px]">El área sombreada en azul de la gráfica superior representa esta región factible.</p>
        </div>
      )
    },
    {
      id: 4,
      title: 'Calcular los Vértices del Polígono',
      color: 'yellow',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Los <span className="text-yellow-400 font-semibold">vértices (esquinas)</span> del polígono convexo son los candidatos donde se alcanza el óptimo:</p>

          <div className="space-y-2 text-[11px]">
            <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3">
              <p className="text-yellow-300 font-bold mb-1">Vértice A: Intersección de ejes → (0, 0)</p>
              <p className="text-slate-400">Origen del sistema. Punto trivial de la región.</p>
            </div>

            <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3">
              <p className="text-yellow-300 font-bold mb-1">Vértice B: R1 con eje x₂ → (0, 3)</p>
              <p className="text-slate-400">Intersección de R2 con el eje vertical cuando x₁ = 0.</p>
            </div>

            <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3">
              <p className="text-yellow-300 font-bold mb-1">Vértice C: Intersección R1 ∩ R2 → (3, 1.5)</p>
              <div className="text-slate-400 space-y-1 pl-2 mt-1">
                <p>Sistema de ecuaciones simultáneas:</p>
                <p className="font-mono text-slate-300">6x₁ + 4x₂ = 24</p>
                <p className="font-mono text-slate-300"> x₁ + 2x₂ = 6  → x₁ = 6 - 2x₂</p>
                <p>Sustituyendo: 6(6 - 2x₂) + 4x₂ = 24</p>
                <p>→ 36 - 12x₂ + 4x₂ = 24  →  -8x₂ = -12  →  <span className="text-white">x₂ = 1.5</span></p>
                <p>→  x₁ = 6 - 2(1.5)  →  <span className="text-white">x₁ = 3</span></p>
              </div>
            </div>

            <div className="bg-slate-900 border border-yellow-900/30 rounded-lg p-3">
              <p className="text-yellow-300 font-bold mb-1">Vértice D: R1 con eje x₁ → (4, 0)</p>
              <p className="text-slate-400">Intersección de R1 con el eje horizontal cuando x₂ = 0.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Evaluar Z en cada Vértice',
      color: 'orange',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>Sustituimos cada vértice en la <span className="text-orange-400 font-semibold">función objetivo Z = 5x₁ + 4x₂</span>:</p>

          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden text-[11px]">
            <div className="grid grid-cols-4 bg-slate-800/60 px-3 py-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <span>Vértice</span>
              <span className="text-center">x₁</span>
              <span className="text-center">x₂</span>
              <span className="text-right">Z = 5x₁ + 4x₂</span>
            </div>
            {[
              { v: 'A', x1: 0, x2: 0, z: 0 },
              { v: 'B', x1: 0, x2: 3, z: 12 },
              { v: 'C', x1: 3, x2: 1.5, z: 21 },
              { v: 'D', x1: 4, x2: 0, z: 20 },
            ].map((row) => (
              <div
                key={row.v}
                className={`grid grid-cols-4 px-3 py-2 border-t border-slate-800/60 ${row.z === 21 ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300'}`}
              >
                <span className="font-bold">{row.v} ({row.x1}, {row.x2})</span>
                <span className="text-center">{row.x1}</span>
                <span className="text-center">{row.x2}</span>
                <span className={`text-right font-mono font-bold ${row.z === 21 ? 'text-amber-300' : ''}`}>
                  {row.z} {row.z === 21 ? '← MÁXIMO' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Solución Óptima e Interpretación',
      color: 'amber',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Solución Óptima Encontrada</p>
            <p className="text-2xl font-black font-mono text-amber-400">Z* = 21</p>
            <p className="text-sm font-mono text-slate-300 mt-1">en el vértice  (x₁ = 3, x₂ = 1.5)</p>
          </div>

          <div className="space-y-2 text-[11px]">
            <p className="text-slate-400"><span className="text-white font-semibold">¿Por qué el Vértice C?</span> El Teorema Fundamental de la PL establece que si existe una solución óptima, siempre se encontrará en al menos un vértice (punto extremo) de la región factible convexa.</p>
            <p className="text-slate-400"><span className="text-white font-semibold">Interpretación:</span> Producir <span className="text-amber-300 font-semibold">3 unidades de x₁</span> y <span className="text-amber-300 font-semibold">1.5 unidades de x₂</span> maximiza la ganancia total en <span className="text-amber-300 font-semibold">$21</span>, sin violar ninguna restricción de recursos.</p>
            <p className="text-slate-400"><span className="text-white font-semibold">Verificación:</span></p>
            <div className="pl-3 font-mono text-slate-400 space-y-0.5">
              <p>R1: 6(3) + 4(1.5) = 18 + 6 = 24 ≤ 24 ✓</p>
              <p>R2:  (3) + 2(1.5) = 3 + 3  =  6 ≤  6 ✓</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const colorMap = {
    blue:   { border: 'border-blue-500/30',   badge: 'bg-blue-500/20 text-blue-300',   dot: 'bg-blue-400' },
    purple: { border: 'border-purple-500/30', badge: 'bg-purple-500/20 text-purple-300', dot: 'bg-purple-400' },
    green:  { border: 'border-green-500/30',  badge: 'bg-green-500/20 text-green-300',  dot: 'bg-green-400' },
    yellow: { border: 'border-yellow-500/30', badge: 'bg-yellow-500/20 text-yellow-300', dot: 'bg-yellow-400' },
    orange: { border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-400' },
    amber:  { border: 'border-amber-500/30',  badge: 'bg-amber-500/20 text-amber-300',  dot: 'bg-amber-400' },
  };

  return (
    <div className="bg-slate-900/80 border border-orange-500/20 rounded-xl p-4 md:col-span-2">
      {/* Header del panel de fallback */}
      <div className="flex items-start gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-orange-400 flex items-center gap-2">
            Guía de Ejemplo: Método Gráfico de Programación Lineal
            <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono tracking-wider">MODO OFFLINE</span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            El servicio de IA no está disponible. Consulta estos pasos didácticos con un ejemplo análogo para interpretar tu solución.
          </p>
        </div>
      </div>

      {/* Acordeón de pasos */}
      <div className="space-y-2">
        {steps.map((step) => {
          const colors = colorMap[step.color];
          const isOpen = expandedStep === step.id;
          return (
            <div
              key={step.id}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${colors.border}`}
            >
              <button
                onClick={() => setExpandedStep(isOpen ? null : step.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-950/60 hover:bg-slate-950/90 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                    Paso {step.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                }
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

      <p className="text-[10px] text-slate-600 mt-3 text-center">
        Aplica esta metodología paso a paso a tu problema específico para validar la solución gráfica.
      </p>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function GraphicSolver({ onBack }) {
  const [objectiveType, setObjectiveType] = useState('MAX');
  const [objectiveCoefficients, setObjectiveCoefficients] = useState(['', '']);
  const [constraints, setConstraints] = useState([
    { coefficients: ['', ''], sign: '<=', rhs: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [zoomRangeX, setZoomRangeX] = useState([0, 20]);
  const [zoomRangeY, setZoomRangeY] = useState([0, 20]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu asistente de IO. ¿Tienes alguna duda sobre la región factible o el vértice óptimo de este modelo gráfico?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatEndRef = useRef(null);
  const graphContainerRef = useRef(null);

  const optimalX = result?.optimal_solution?.variables?.x1 ?? null;
  const optimalY = result?.optimal_solution?.variables?.x2 ?? null;

  // Determina si el análisis de IA está disponible o es válido
  const hasAiAnalysis = result?.analysis && typeof result.analysis === 'string' && result.analysis.trim().length > 10;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, isChatOpen]);

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

  const addConstraint = () => {
    setConstraints([...constraints, { coefficients: ['', ''], sign: '<=', rhs: '' }]);
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

    const res = await ioApi.solveGraphic(payload);
    setLoading(false);

    if (res.success) {
      setResult(res.data);

      if (res.data.feasible_region && res.data.feasible_region.length > 0) {
        const maxX = Math.max(...res.data.feasible_region.map(p => p[0]), 10);
        const maxY = Math.max(...res.data.feasible_region.map(p => p[1]), 10);
        setZoomRangeX([0, Math.ceil(maxX * 1.5)]);
        setZoomRangeY([0, Math.ceil(maxY * 1.5)]);
      }
    } else {
      setError(res.message || "Error al calcular la solución geométrica.");
    }
  };

  const getGraphPoints = () => {
    if (!result || !result.feasible_region || result.feasible_region.length === 0) return [];
    const points = result.feasible_region.map(pt => ({ x: pt[0], y: pt[1] }));
    const center = points.reduce((acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }), { x: 0, y: 0 });
    return points.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));
  };

  const getConstraintLines = () => {
    if (!result) return [];
    return constraints.map((c, idx) => {
      const a = parseFloat(c.coefficients[0]) || 0;
      const b = parseFloat(c.coefficients[1]) || 0;
      const r = parseFloat(c.rhs) || 0;

      if (a !== 0 && b !== 0) {
        return { id: idx, p1: { x: 0, y: r / b }, p2: { x: r / a, y: 0 }, label: `R${idx + 1}` };
      } else if (a !== 0) {
        return { id: idx, isVertical: true, x: r / a, label: `R${idx + 1}` };
      } else if (b !== 0) {
        return { id: idx, isHorizontal: true, y: r / b, label: `R${idx + 1}` };
      }
      return null;
    }).filter(Boolean);
  };

  const handleWheel = (e) => {
    if (!result) return;
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newMaxX = Math.max(zoomRangeX[1] * zoomFactor, 2);
    const newMaxY = Math.max(zoomRangeY[1] * zoomFactor, 2);

    setZoomRangeX([0, newMaxX]);
    setZoomRangeY([0, newMaxY]);
  };

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const onWheelNative = (e) => {
      if (result) {
        e.preventDefault();
        handleWheel(e);
      }
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', onWheelNative);
  }, [result, zoomRangeX, zoomRangeY]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      // Contexto del problema actual para el chat
      const context = result
        ? `El usuario tiene un problema de PL con función objetivo ${objectiveType} Z = ${objectiveCoefficients.join(', ')}. Solución óptima: x1=${optimalX}, x2=${optimalY}, Z=${result.optimal_solution?.objective_value}.`
        : 'Aún no se ha calculado ningún problema.';

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Eres un asistente experto en Investigación de Operaciones y Programación Lineal. Contexto: ${context}. Pregunta del usuario: ${inputMessage}. Responde de forma concisa y didáctica en español.`
            }
          ]
        })
      });
      const data = await response.json();
      const botText = data.content?.[0]?.text || 'No pude generar una respuesta. Intenta de nuevo.';
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botText }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Error de conexión. Verifica tu red e intenta de nuevo.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const graphData = getGraphPoints();
  const constraintLines = getConstraintLines();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md h-fit">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-400" /> Parámetros Gráficos
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Optimización</label>
                <div className="flex gap-2">
                  <button
                    type="button" onClick={() => setObjectiveType('MAX')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${objectiveType === 'MAX' ? 'bg-blue-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >MAX</button>
                  <button
                    type="button" onClick={() => setObjectiveType('MIN')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${objectiveType === 'MIN' ? 'bg-indigo-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >MIN</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Función Objetivo (Z)</label>
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-mono text-slate-500">Z =</span>
                  <input
                    type="number" step="any" placeholder="0" value={objectiveCoefficients[0]} required
                    onChange={(e) => handleObjChange(0, e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-center text-white"
                  />
                  <span className="text-xs text-slate-400">x₁ +</span>
                  <input
                    type="number" step="any" placeholder="0" value={objectiveCoefficients[1]} required
                    onChange={(e) => handleObjChange(1, e.target.value)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-xs text-center text-white"
                  />
                  <span className="text-xs text-slate-400">x₂</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Restricciones</label>
                  <button
                    type="button" onClick={addConstraint}
                    className="text-[10px] bg-slate-950 border border-slate-800 hover:border-blue-500/40 px-2 py-1 rounded text-blue-400 cursor-pointer"
                  >+ Añadir</button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {constraints.map((constraint, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800/40">
                      <input
                        type="number" step="any" placeholder="0" value={constraint.coefficients[0]} required
                        onChange={(e) => handleConstraintCoefChange(cIdx, 0, e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-800 rounded py-1 text-center font-mono text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-500">x₁+</span>
                      <input
                        type="number" step="any" placeholder="0" value={constraint.coefficients[1]} required
                        onChange={(e) => handleConstraintCoefChange(cIdx, 1, e.target.value)}
                        className="w-12 bg-slate-900 border border-slate-800 rounded py-1 text-center font-mono text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-500">x₂</span>

                      <select
                        value={constraint.sign}
                        onChange={(e) => handleConstraintMetaChange(cIdx, 'sign', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded py-1 text-xs text-slate-300 font-bold"
                      >
                        <option value="<=">&le;</option>
                        <option value=">=">&ge;</option>
                        <option value="=">=</option>
                      </select>

                      <input
                        type="number" step="any" placeholder="RHS" value={constraint.rhs} required
                        onChange={(e) => handleConstraintMetaChange(cIdx, 'rhs', e.target.value)}
                        className="w-14 bg-slate-900 border border-slate-800 rounded py-1 text-center font-mono text-xs text-white"
                      />

                      <button
                        type="button" disabled={constraints.length === 1} onClick={() => removeConstraint(cIdx)}
                        className="text-slate-600 hover:text-red-400 disabled:opacity-20 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
              >
                {loading ? 'Calculando Geometría...' : 'Renderizar Área Factible'}
              </button>
            </form>

            {error && <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-400">{error}</div>}
          </div>

          {/* COLUMNA DERECHA: LIENZO GRÁFICO */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[400px] flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Espacio Factible Geométrico</h3>
                <span className="text-[10px] text-slate-500 font-mono">Usa la ruedita del ratón para hacer Zoom</span>
              </div>

              <div className="flex-grow w-full mt-4" ref={graphContainerRef}>
                {result && graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis type="number" dataKey="x" name="x1" stroke="#64748B" fontSize={11} domain={zoomRangeX} allowDataOverflow />
                      <YAxis type="number" dataKey="y" name="x2" stroke="#64748B" fontSize={11} domain={zoomRangeY} allowDataOverflow />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                      <Polygon
                        points={graphData}
                        fill="#3b82f6"
                        fillOpacity={0.15}
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />

                      {constraintLines.map((line) => {
                        if (line.isVertical) {
                          return <ReferenceLine key={line.id} x={line.x} stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: line.label, fill: '#ec4899', fontSize: 10, position: 'top' }} />;
                        }
                        if (line.isHorizontal) {
                          return <ReferenceLine key={line.id} y={line.y} stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: line.label, fill: '#ec4899', fontSize: 10, position: 'right' }} />;
                        }
                        return (
                          <ReferenceLine
                            key={line.id}
                            segment={[line.p1, line.p2]}
                            stroke="#8b5cf6"
                            strokeWidth={1.5}
                            label={{ value: line.label, fill: '#8b5cf6', fontSize: 10, position: 'end' }}
                          />
                        );
                      })}

                      <Scatter data={graphData} fill="#64748B" />

                      {optimalX !== null && optimalY !== null && (
                        <ReferenceDot
                          x={optimalX}
                          y={optimalY}
                          r={7}
                          fill="#f59e0b"
                          stroke="#000"
                          strokeWidth={2}
                          label={{ value: 'ÓPTIMO', fill: '#f59e0b', fontSize: 10, position: 'top', fontWeight: 'bold' }}
                        />
                      )}
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 font-mono text-lg mb-2">Z</div>
                    <p className="text-xs text-slate-500 max-w-xs">Ingresa los datos y presiona calcular para proyectar las líneas límite y el polígono convexo de factibilidad.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PANEL INFERIOR: ANALÍTICA + IA o FALLBACK */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Coordenadas siempre visibles */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coordenadas del Plano</span>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    Z = {result.optimal_solution?.objective_value ?? 'Inviable'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Vértice Solución: ({optimalX ?? 0}, {optimalY ?? 0})
                  </div>
                </div>

                {/* Panel condicional: IA real o fallback educativo */}
                {hasAiAnalysis ? (
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/10 rounded-xl p-4 md:col-span-2">
                    <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-2">
                      <Brain className="w-3.5 h-3.5" /> Interpretación del Consultor de IA
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
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
      </div>

      {/* CHAT FLOTANTE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

        {isChatOpen && (
          <div className="w-[350px] sm:w-[400px] h-[500px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col mb-4 overflow-hidden backdrop-blur-md">

            <div className="p-4 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Asistente de Optimización</h4>
                  <span className="text-[10px] text-blue-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Claude Activo
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-slate-950 font-semibold rounded-tr-none shadow-md'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none p-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider text-slate-500">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800/60 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre la región factible, límites..."
                disabled={isChatLoading}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-slate-950 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
            isChatOpen
              ? 'bg-slate-800 border border-slate-700 text-slate-300 rotate-90'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-slate-950 hover:shadow-blue-500/20'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}