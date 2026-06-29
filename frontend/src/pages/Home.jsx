import React, { useState } from 'react';
import { Layers, BarChart2, Truck, Brain, Activity, MessageSquare, X, Send, Bot } from 'lucide-react';

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

  // --- Estados para el Chat Flotante ---
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '¡Hola! Soy tu asistente de IO. ¿En qué puedo ayudarte hoy con tus modelos u optimizaciones?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Función para enviar mensajes a Ollama ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Agregar el mensaje del usuario al chat
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/asistente/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context_data: {} // Opcional: pasar datos de problemas cargados si es necesario
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans p-6 md:p-12 selection:bg-emerald-500 selection:text-black relative">
      
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

      {/* ========================================================= */}
      {/* COMPONENTE INTERACTIVO: CHAT FLOTANTE DE IA              */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Ventana de Conversación Abierta */}
        {isOpen && (
          <div className="w-[350px] sm:w-[400px] h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black flex flex-col mb-4 overflow-hidden backdrop-blur-lg">
            
            {/* Header del Chat */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Asistente de Optimización</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ollama Activo
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
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium rounded-tr-none shadow-md' 
                      : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Efecto de carga / procesando tokens */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-xl rounded-tl-none p-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[10px] font-mono tracking-wider">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input del Chat */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre Simplex, Vogel..."
                disabled={isLoading}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 transition-all shadow-md shadow-purple-950/50"
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
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-900/30'
          }`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>

      </div>
    </div>
  );
}