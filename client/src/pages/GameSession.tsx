import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useGameSession, useGameAction } from "@/hooks/use-game";
import { CRTOverlay } from "@/components/CRTOverlay";
import { StatusMonitor } from "@/components/StatusMonitor";
import { TerminalText } from "@/components/TerminalText";
import { Send, Terminal as TerminalIcon, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameSession() {
  const { id } = useParams();
  const sessionId = id || "";
  
  const { data, isLoading, error } = useGameSession(sessionId);
  const { mutate: sendAction, isPending: isSending } = useGameAction(sessionId);
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    sendAction(input);
    setInput("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-primary gap-4">
        <CRTOverlay />
        <div className="animate-spin text-4xl">✣</div>
        <div className="tracking-widest animate-pulse">ESTABLISHING NEURAL LINK...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-destructive gap-4 p-8 text-center">
        <CRTOverlay />
        <AlertTriangle className="w-16 h-16" />
        <h1 className="text-4xl font-display font-bold">SIGNAL LOST</h1>
        <p className="max-w-md">The connection to the neural interface has been severed. The session may have expired or encountered a fatal error.</p>
        <a href="/" className="mt-8 px-6 py-2 border border-destructive hover:bg-destructive hover:text-black transition-colors uppercase tracking-widest">
          Return to Menu
        </a>
      </div>
    );
  }

  const { session, messages } = data;
  const isGameOver = session.status === "game_over" || session.status === "escaped";

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden font-mono text-white relative">
      <CRTOverlay />

      {/* Header / HUD */}
      <header className="z-10 sticky top-0 bg-black/80 backdrop-blur border-b border-primary/20">
        <div className="flex items-center justify-between px-6 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-primary">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-sm font-bold tracking-widest">SESSION: {session.sessionId.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className={`text-xs px-2 py-0.5 border ${
               session.status === 'active' ? 'border-primary text-primary animate-pulse' : 
               session.status === 'game_over' ? 'border-destructive text-destructive' :
               'border-green-500 text-green-500'
             }`}>
               {session.status.toUpperCase()}
             </span>
          </div>
        </div>
        <StatusMonitor metadata={session.metadata as any} />
      </header>

      {/* Main Terminal Feed */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth z-0 relative container mx-auto max-w-5xl"
      >
        <div className="absolute inset-0 grid grid-cols-[1fr_minmax(0,1024px)_1fr] pointer-events-none opacity-5">
           <div className="border-r border-dashed border-white"></div>
           <div></div>
           <div className="border-l border-dashed border-white"></div>
        </div>

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <TerminalText 
              key={msg.id} 
              text={msg.content} 
              role={msg.role as any} 
              isNew={idx === messages.length - 1} 
            />
          ))}
          {isSending && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-primary/50 text-sm italic animate-pulse"
            >
              Processing command...
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Spacer for scrolling */}
        <div className="h-4" />
      </main>

      {/* Input Area */}
      <footer className="z-10 bg-black border-t border-primary/20 p-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {isGameOver ? (
            <div className="text-center space-y-4">
              <h2 className={`text-3xl font-display font-bold ${session.status === 'game_over' ? 'text-destructive' : 'text-green-500'}`}>
                {session.status === 'game_over' ? 'FLATLINE DETECTED' : 'EXTRACTION COMPLETE'}
              </h2>
              <a href="/" className="inline-block px-8 py-3 bg-white/5 border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-widest text-sm">
                Reboot System
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-lg blur opacity-25 group-focus-within:opacity-75 transition duration-500" />
              <div className="relative flex items-center bg-black rounded-lg border border-primary/30 overflow-hidden">
                <span className="pl-4 text-primary animate-pulse">{'>'}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter command..."
                  disabled={isSending}
                  autoFocus
                  className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:ring-0 focus:outline-none font-mono placeholder:text-gray-700"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="px-6 py-4 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
}
