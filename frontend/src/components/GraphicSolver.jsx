import React, { useState } from 'react';
import { Plus, Trash2, BarChart2, Brain, ArrowLeft } from 'lucide-react';
import { ioApi } from '../services/api';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Polygon, ReferenceDot, ReferenceLine } from 'recharts';

export default function GraphicSolver({ onBack }) {
  const [objectiveType, setObjectiveType] = useState('MAX');
  const [objectiveCoefficients, setObjectiveCoefficients] = useState(['', '']);
  const [constraints, setConstraints] = useState([
    { coefficients: ['', ''], sign: '<=', rhs: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Estados para el Zoom Dinámico
  const [zoomRangeX, setZoomRangeX] = useState([0, 20]);
  const [zoomRangeY, setZoomRangeY] = useState([0, 20]);

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
      
      // Auto-escalar el zoom inicial en base a los vértices encontrados
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

  // Generar las líneas de restricción de extremo a extremo del gráfico
  const getConstraintLines = () => {
    if (!result) return [];
    return constraints.map((c, idx) => {
      const a = parseFloat(c.coefficients[0]) || 0;
      const b = parseFloat(c.coefficients[1]) || 0;
      const r = parseFloat(c.rhs) || 0;

      // Si corta ambos ejes
      if (a !== 0 && b !== 0) {
        return { id: idx, p1: { x: 0, y: r / b }, p2: { x: r / a, y: 0 }, label: `R${idx + 1}` };
      } else if (a !== 0) { // Línea Vertical (x1 = constante)
        return { id: idx, isVertical: true, x: r / a, label: `R${idx + 1}` };
      } else if (b !== 0) { // Línea Horizontal (x2 = constante)
        return { id: idx, isHorizontal: true, y: r / b, label: `R${idx + 1}` };
      }
      return null;
    }).filter(Boolean);
  };

  // Manejador del Scroll del Mouse para hacer Zoom In / Zoom Out
  const handleWheel = (e) => {
    if (!result) return;
    e.preventDefault(); // Evitar que la página entera haga scroll involuntario

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9; // Hacia abajo aleja, hacia arriba acerca
    
    const currentMaxX = zoomRangeX[1];
    const currentMaxY = zoomRangeY[1];

    // Establecer límites mínimos para no romper el plano cartesiano
    const newMaxX = Math.max(currentMaxX * zoomFactor, 2);
    const newMaxY = Math.max(currentMaxY * zoomFactor, 2);

    setZoomRangeX([0, newMaxX]);
    setZoomRangeY([0, newMaxY]);
  };

  const graphData = getGraphPoints();
  const constraintLines = getConstraintLines();
  const optimalX = result?.optimal_solution?.variables?.x1;
  const optimalY = result?.optimal_solution?.variables?.x2;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12">
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
                  >
                    MAX
                  </button>
                  <button
                    type="button" onClick={() => setObjectiveType('MIN')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${objectiveType === 'MIN' ? 'bg-indigo-500 text-slate-950' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
                  >
                    MIN
                  </button>
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
                  >
                    + Añadir
                  </button>
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

          {/* COLUMNA DERECHA: LIENZO GRÁFICO INTERACTIVO (CON RECTAS Y ZOOM) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[400px] flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Espacio Factible Geométrico</h3>
                <span className="text-[10px] text-slate-500 font-mono">Usa la ruedita del ratón para hacer Zoom</span>
              </div>

              <div className="flex-grow w-full mt-4" onWheel={handleWheel}>
                {result && graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      
                      {/* Ejes con dominios dinámicos controlados por el Zoom */}
                      <XAxis type="number" dataKey="x" name="x1" stroke="#64748B" fontSize={11} domain={zoomRangeX} allowDataOverflow />
                      <YAxis type="number" dataKey="y" name="x2" stroke="#64748B" fontSize={11} domain={zoomRangeY} allowDataOverflow />
                      
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      
                      {/* 1. Dibuja e ilumina la región convexa factible */}
                      <Polygon
                        points={graphData}
                        fill="#3b82f6"
                        fillOpacity={0.15}
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />

                      {/* 2. PROYECTAR LAS RECTAS LÍMITE DE LAS RESTRICCIONES */}
                      {constraintLines.map((line) => {
                        if (line.isVertical) {
                          return <ReferenceLine key={line.id} x={line.x} stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: line.label, fill: '#ec4899', fontSize: 10, position: 'top' }} />;
                        }
                        if (line.isHorizontal) {
                          return <ReferenceLine key={line.id} y={line.y} stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: line.label, fill: '#ec4899', fontSize: 10, position: 'right' }} />;
                        }
                        // Ecuación general que cruza el plano: interpolamos los cortes cartesianos como segmentos
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

                      {/* 3. Marca las esquinas evaluadas en el plano */}
                      <Scatter data={graphData} fill="#64748B" />

                      {/* 4. Resalta el punto exacto de la solución óptima */}
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

            {/* PANEL INFERIOR DE ANALÍTICA E IA */}
            {result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coordenadas del Plano</span>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    Z = {result.optimal_solution.objective_value ?? 'Inviable'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Vértice Solución: ({optimalX}, {optimalY})
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/10 rounded-xl p-4 md:col-span-2">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1 mb-2">
                    <Brain className="w-3.5 h-3.5" /> Interpretación del Consultor de IA
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {result.analysis}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}