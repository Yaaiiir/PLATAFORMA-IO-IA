import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Brain, ArrowLeft } from 'lucide-react';
import { ioApi } from '../services/api';

export default function SimplexSolver({ onBack }) {
  // Estados principales del formulario
  const [objectiveType, setObjectiveType] = useState('MAX');
  const [numVariables, setNumVariables] = useState(2);
  const [objectiveCoefficients, setObjectiveCoefficients] = useState(['', '']);
  
  // Las restricciones se guardan como objetos con sus coeficientes, signo y valor derecho (rhs)
  const [constraints, setConstraints] = useState([
    { coefficients: ['', ''], sign: '<=', rhs: '' }
  ]);

  // Estados para manejar la respuesta del backend
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Manejar cambio en los coeficientes de la función objetivo
  const handleObjChange = (index, value) => {
    const updated = [...objectiveCoefficients];
    updated[index] = value;
    setObjectiveCoefficients(updated);
  };

  // Manejar cambio en los coeficientes de las restricciones
  const handleConstraintCoefChange = (cIndex, vIndex, value) => {
    const updated = [...constraints];
    updated[cIndex].coefficients[vIndex] = value;
    setConstraints(updated);
  };

  // Manejar cambio en el signo o RHS de una restricción
  const handleConstraintMetaChange = (index, field, value) => {
    const updated = [...constraints];
    updated[index][field] = value;
    setConstraints(updated);
  };

  // Incrementar o decrementar el número global de variables de decisión
  const adjustVariables = (newNum) => {
    if (newNum < 1 || newNum > 10) return; // Límites razonables de UI
    
    setNumVariables(newNum);
    
    // Ajustar arreglo de la función objetivo
    const newObj = [...objectiveCoefficients];
    if (newNum > newObj.length) {
      while (newObj.length < newNum) newObj.push('');
    } else {
      newObj.length = newNum;
    }
    setObjectiveCoefficients(newObj);

    // Ajustar los coeficientes dentro de cada restricción existente
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

  // Añadir una nueva fila de restricción
  const addConstraint = () => {
    const emptyCoefs = Array(numVariables).fill('');
    setConstraints([...constraints, { coefficients: emptyCoefs, sign: '<=', rhs: '' }]);
  };

  // Eliminar una fila de restricción
  const removeConstraint = (index) => {
    if (constraints.length === 1) return;
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  // Enviar el problema optimizado al backend de FastAPI
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Formatear y parsear los datos de string a números flotantes para la API
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

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón de regreso */}
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
            
            {/* Control de Variables y Tipo de Optimización */}
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

            {/* Función Objetivo Coeficientes */}
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

            {/* Restricciones Dinámicas */}
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

                    {/* Signo de la restricción */}
                    <select
                      value={constraint.sign}
                      onChange={(e) => handleConstraintMetaChange(cIdx, 'sign', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="<=">&le;</option>
                      <option value=">=">&ge;</option>
                      <option value="=">=</option>
                    </select>

                    {/* Lado derecho (RHS) */}
                    <input
                      type="number"
                      step="any"
                      placeholder="RHS"
                      value={constraint.rhs}
                      required
                      onChange={(e) => handleConstraintMetaChange(cIdx, 'rhs', e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm text-center focus:outline-none focus:border-emerald-500 text-white"
                    />

                    {/* Eliminar restricción */}
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

            {/* Botón Calcular */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? 'Calculando con el motor e IA...' : 'Calcular Solución Óptima'}
            </button>
          </form>

          {/* Renderizado de Errores */}
          {error && (
            <div className="mt-6 p-4 bg-red-950/40 border border-red-900/60 rounded-xl text-sm text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* RENDERIZADO DE RESULTADOS & ANÁLISIS DE IA */}
          {result && (
            <div className="mt-8 space-y-6 border-t border-slate-800 pt-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-200">Resultados Analíticos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor Óptimo (Z)</span>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                    {result.data.objective_value !== null ? result.data.objective_value : 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Asignación de Variables</span>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-sm">
                    {Object.entries(result.data.variables).map(([name, val]) => (
                      <div key={name} className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800/40 flex justify-between">
                        <span className="text-slate-400 font-bold">{name}:</span>
                        <span className="text-slate-200 font-black">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenedor de Interpretación de IA */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-purple-500/10 rounded-xl p-5 shadow-inner">
                <h4 className="text-sm font-bold text-purple-400 flex items-center gap-1.5 mb-3">
                  <Brain className="w-4 h-4 text-purple-400" /> Interpretación del Consultor de IA
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