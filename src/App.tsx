
import React, { useState, useRef, useEffect } from 'react';
import { type Message, type AgentAction, type RuleFile } from './types';
import { processBoardGameQuery } from './GeminiService';
import { 
  DocumentArrowUpIcon, 
  CpuChipIcon, 
  PaperAirplaneIcon,
  BookOpenIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ruleFile, setRuleFile] = useState<RuleFile | null>(null);
  const [logs, setLogs] = useState<AgentAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollLogsToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollLogsToBottom();
  }, [logs]);

  const addLog = (actionText: string) => {
    const newLog: AgentAction = {
      id: Math.random().toString(36).substring(7),
      agent: actionText.split(':')[0] || 'System',
      action: actionText.includes(':') ? actionText.split(':').slice(1).join(':').trim() : actionText,
      status: 'active'
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Please upload a PDF file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setRuleFile({
          name: file.name,
          base64: base64,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setLogs([]);

    try {
      const answer = await processBoardGameQuery(input, ruleFile, addLog);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: answer,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my rule scholar agents. Please check your setup and try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-slate-200 overflow-hidden font-sans lg:flex-row flex-col">
      {/* Sidebar */}
      <aside className="lg:w-80 w-full bg-[#0b1120] border-r border-slate-800 p-6 flex flex-col gap-8 shrink-0 overflow-y-auto">
        <header className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
            <BookOpenIcon className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-bold font-serif text-amber-500 tracking-tight">RuleMaster AI</span>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <DocumentArrowUpIcon className="w-4 h-4" /> Game Rules
          </h2>
          {!ruleFile ? (
            <label className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-500/50 hover:bg-slate-900/50 transition-all group">
              <DocumentArrowUpIcon className="w-8 h-8 text-slate-600 mx-auto mb-2 group-hover:text-amber-500" />
              <p className="text-xs text-slate-500 font-medium">Upload PDF</p>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
            </label>
          ) : (
            <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <DocumentArrowUpIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs truncate font-medium text-slate-300">{ruleFile.name}</span>
              </div>
              <button onClick={() => setRuleFile(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>

        <section className="flex-1 flex flex-col min-h-0 gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <CpuChipIcon className="w-4 h-4" /> Agent Thinking
          </h2>
          <div className="flex-1 bg-black/20 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {logs.length === 0 && !isProcessing && (
              <p className="text-[10px] text-slate-700 italic text-center mt-4">Waiting for query...</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="animate-in slide-in-from-left-2 fade-in duration-300">
                <span className="text-[10px] font-bold text-amber-500 block mb-1 uppercase tracking-wider">{log.agent}</span>
                <span className={`text-[11px] leading-relaxed block ${log.action.includes('REJECTED') ? 'text-red-400' : 'text-slate-400'}`}>
                  {log.action}
                </span>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </section>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a]">
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-6 animate-in fade-in zoom-in-95 duration-700">
              <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-slate-800/50 shadow-2xl">
                <SparklesIcon className="w-16 h-16 text-amber-500" />
              </div>
              <h3 className="text-4xl font-serif font-bold text-slate-100">Rule verification, refined.</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload a rulebook and ask any question. My swarm of AI scholars will cross-verify rules up to 3 times to ensure your game night stays on track.
              </p>
            </div>
          )}
          
          {messages.map((m) => (
            <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] lg:max-w-[70%] p-5 rounded-3xl shadow-xl ${
                m.role === 'user' 
                ? 'bg-amber-600 text-white rounded-tr-none' 
                : 'bg-[#0f172a] border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="space-y-3">
                  {m.content.split('\n').map((line, i) => (
                    <p key={i} className="text-[15px] leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <footer className="p-6 bg-[#020617]/80 backdrop-blur-xl border-t border-slate-900">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ruleFile ? `Consulting rules for ${ruleFile.name}...` : "Ask a rule question..."}
              disabled={isProcessing}
              className="w-full bg-[#0f172a] border border-slate-800 text-slate-100 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all disabled:opacity-50 text-base shadow-inner"
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 p-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-4 text-center">
             <p className="text-[10px] text-slate-700 uppercase tracking-[0.3em] font-black">Multi-Agent Verification Engine</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
