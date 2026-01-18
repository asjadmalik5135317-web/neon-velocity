import { useStartGame } from "@/hooks/use-game";
import { CRTOverlay } from "@/components/CRTOverlay";
import { motion } from "framer-motion";
import { Power } from "lucide-react";

export default function Home() {
  const { mutate: startGame, isPending } = useStartGame();

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden p-4">
      <CRTOverlay />

      {/* Background Decor */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,minmax(0,1fr))] opacity-10 pointer-events-none">
        {Array.from({ length: 400 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-primary/20 aspect-square" />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "anticipate" }}
        className="z-10 text-center space-y-12 max-w-4xl w-full"
      >
        <div className="space-y-4">
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary/50 glitch-text drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            data-text="NEON VELOCITY"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(0,255,255,0.5)", 
                "0 0 40px rgba(0,255,255,0.8)", 
                "0 0 20px rgba(0,255,255,0.5)"
              ] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            NEON VELOCITY
          </motion.h1>
          <p className="text-primary/60 font-mono tracking-[0.2em] text-sm md:text-lg uppercase">
            Cyberpunk Interactive Fiction Protocol v2.88
          </p>
        </div>

        <div className="relative group mx-auto w-fit">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
          <button
            onClick={() => startGame()}
            disabled={isPending}
            className="relative px-12 py-6 bg-black border border-primary text-primary font-display text-xl md:text-2xl font-bold tracking-widest uppercase hover:bg-primary hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 group-active:scale-95"
          >
            {isPending ? (
              <>
                <span className="animate-spin text-2xl">⟳</span>
                Initializing...
              </>
            ) : (
              <>
                <Power className="w-6 h-6" />
                Initialize System
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-24 opacity-60">
          <div className="border-l-2 border-primary/30 pl-4">
            <h3 className="text-primary font-mono text-sm mb-2">TARGET</h3>
            <p className="text-xs font-mono text-gray-400">Survive the pursuit in New Kyoto's vertical sprawl.</p>
          </div>
          <div className="border-l-2 border-primary/30 pl-4">
            <h3 className="text-primary font-mono text-sm mb-2">ASSET</h3>
            <p className="text-xs font-mono text-gray-400">Stolen Aether-7 Prototype with phase-shift capabilities.</p>
          </div>
          <div className="border-l-2 border-primary/30 pl-4">
            <h3 className="text-primary font-mono text-sm mb-2">THREAT</h3>
            <p className="text-xs font-mono text-gray-400">High-Speed Patrol Units & Corporate Headhunters.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
