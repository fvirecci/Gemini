
import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { TopicSelector } from './components/TopicSelector';
import { Message, Topic } from './types';
import { DEFAULT_TOPICS } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic>(DEFAULT_TOPICS[0]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiStudio, setIsAiStudio] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Controlla se siamo in un ambiente AI Studio
    const checkEnv = async () => {
      if (window.aistudio) {
        setIsAiStudio(true);
        if (!(await window.aistudio.hasSelectedApiKey())) {
          await window.aistudio.openSelectKey();
        }
      }
    };
    checkEnv();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(input, messages, currentTopic);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      let errorTitle = "Problema di Connessione";
      let errorText = "Non riesco a contattare Gemini. Riprova tra poco.";
      
      if (error.message === "MISSING_API_KEY") {
        errorTitle = "Chiave API Mancante";
        errorText = "La configurazione su Vercel non è completa. Assicurati di aver aggiunto 'API_KEY' nelle impostazioni e di aver fatto un 'Redeploy'.";
        
        // Se siamo in AI Studio, offriamo di riaprire il selettore
        if (isAiStudio && window.aistudio) {
          window.aistudio.openSelectKey();
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **${errorTitle}**\n\n${errorText}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fc] text-slate-900">
      <Header />
      
      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <TopicSelector currentTopicId={currentTopic.id} onSelectTopic={(t) => setCurrentTopic(t)} />
        
        <section className="flex-1 flex flex-col h-full bg-white relative shadow-inner">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                  <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center text-6xl shadow-2xl border border-indigo-50 relative z-10 rotate-3">
                    {currentTopic.icon}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                    Ciao! Sono il tuo <span className="text-indigo-600">{currentTopic.name}</span>.
                  </h3>
                  <p className="text-slate-500 text-xl leading-relaxed">
                    Come posso esserti utile oggi? Posso cercare informazioni sul web o aiutarti con i tuoi compiti.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setInput("Quali sono le ultime notizie di oggi?")}>
                    <p className="text-sm font-bold text-slate-800 mb-1">🔍 Ricerca Web</p>
                    <p className="text-xs text-slate-500 italic">"Quali sono le ultime notizie di oggi?"</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => setInput("Suggeriscimi un'idea per un progetto creativo.")}>
                    <p className="text-sm font-bold text-slate-800 mb-1">💡 Ispirazione</p>
                    <p className="text-xs text-slate-500 italic">"Suggeriscimi un'idea creativa."</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%]`}>
                  <div className={`p-6 rounded-[28px] shadow-sm leading-relaxed transition-all ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200' 
                      : 'bg-[#f0f2f7] text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    <p className="text-sm md:text-[16px] whitespace-pre-wrap font-medium">{msg.content}</p>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-200/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Riferimenti Verificati:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, idx) => (
                            <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] px-3 py-2 bg-white/50 backdrop-blur rounded-xl border border-slate-200 text-indigo-600 hover:border-indigo-400 hover:bg-white transition-all flex items-center shadow-sm">
                              <span className="mr-1.5 text-xs">🔗</span> {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-[11px] text-slate-400 mt-2 font-semibold ${msg.role === 'user' ? 'text-right mr-3' : 'text-left ml-3'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 px-8 py-5 rounded-3xl rounded-tl-none border border-slate-100 flex items-center space-x-3 shadow-sm">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10 bg-white/80 backdrop-blur-xl border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-4">
              <div className="flex-1 relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Scrivi qui il tuo messaggio..."
                  rows={1}
                  className="w-full bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-500/20 rounded-[28px] px-8 py-5 focus:outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all resize-none min-h-[64px] text-slate-700 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-[64px] w-[64px] rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center flex-shrink-0 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100"
              >
                <svg className="w-7 h-7 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-tighter">
              Alimentato da Gemini 3 Flash • Risposte in tempo reale
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
