
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
  const [showKeyModal, setShowKeyModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      // Questo serve solo se stai testando dentro l'ambiente di Google AI Studio
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        setShowKeyModal(true);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setShowKeyModal(false);
    }
  };

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
      let errorMsg = "Si è verificato un problema di connessione.";
      
      if (error.message === "MISSING_API_KEY") {
        errorMsg = "ATTENZIONE: La chiave API non è configurata. Aggiungi API_KEY nelle impostazioni di Vercel e fai il redeploy.";
      } else if (error.status === 403) {
        errorMsg = "ERRORE 403: La tua chiave API non è valida o è scaduta.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <Header />
      
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-gray-100 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">🔑</div>
            <h3 className="text-2xl font-bold mb-3">Configurazione Richiesta</h3>
            <p className="text-gray-600 mb-8 text-sm">
              Se sei su Vercel, assicurati di aver configurato la variabile <strong>API_KEY</strong>. Se sei in AI Studio, clicca il tasto qui sotto.
            </p>
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Seleziona Chiave API
            </button>
          </div>
        </div>
      )}

      <main className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <TopicSelector currentTopicId={currentTopic.id} onSelectTopic={(t) => setCurrentTopic(t)} />
        
        <section className="flex-1 flex flex-col h-full bg-white relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-6 animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-indigo-50 rounded-[30%] flex items-center justify-center text-5xl mb-2 shadow-sm border border-indigo-100 rotate-3">
                  {currentTopic.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Ciao, come posso aiutarti?</h3>
                  <p className="text-gray-500 text-lg">
                    Scegli un argomento a sinistra e iniziamo a conversare.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-blue-800 text-xs text-left">
                  <p className="font-bold mb-1 italic">Pro-tip per Vercel:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Aggiungi <b>API_KEY</b> in "Environment Variables".</li>
                    <li>Fai clic su "Redeploy" per attivare la chiave.</li>
                    <li>Ignora i warning di build di npm, non bloccano il sito.</li>
                  </ul>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%]`}>
                  <div className={`p-5 rounded-[24px] shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200/40">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Fonti:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, idx) => (
                            <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center shadow-sm">
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-2 font-medium ${msg.role === 'user' ? 'text-right mr-2' : 'text-left ml-2'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 px-6 py-4 rounded-3xl rounded-tl-none border border-gray-100 flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 md:p-8 bg-white/90 backdrop-blur-sm border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Scrivi un messaggio..."
                  rows={1}
                  className="w-full bg-gray-100 border-transparent focus:bg-white border border-gray-200 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all resize-none min-h-[58px] text-gray-700"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-[58px] w-[58px] rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center flex-shrink-0 active:scale-90 disabled:opacity-30 disabled:grayscale"
              >
                <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
