import { motion } from "framer-motion";
import { Activity, Shield, Zap, Cpu } from "lucide-react";

interface StatusMonitorProps {
  metadata?: Record<string, any>;
}

export function StatusMonitor({ metadata }: StatusMonitorProps) {
  // Default values if metadata is empty
  const integrity = metadata?.integrity ?? 100;
  const energy = metadata?.energy ?? 85;
  const threat = metadata?.threatLevel ?? "LOW";
  const speed = metadata?.speed ?? "0 MPH";

  const getBarColor = (val: number) => {
    if (val > 60) return "bg-primary shadow-[0_0_10px_var(--primary)]";
    if (val > 30) return "bg-yellow-400 shadow-[0_0_10px_var(--yellow-400)]";
    return "bg-destructive shadow-[0_0_10px_var(--destructive)]";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-primary/20 bg-black/40 backdrop-blur-md">
      {/* Integrity Module */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-primary/70 mb-1">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> INTEGRITY</span>
          <span className="font-mono">{integrity}%</span>
        </div>
        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${integrity}%` }}
            transition={{ duration: 1 }}
            className={`h-full ${getBarColor(integrity)}`}
          />
        </div>
      </div>

      {/* Energy Module */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-primary/70 mb-1">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AETHER CORE</span>
          <span className="font-mono">{energy}%</span>
        </div>
        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${energy}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full ${getBarColor(energy)}`}
          />
        </div>
      </div>

      {/* Speed Module */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-primary/70 mb-1">
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> VELOCITY</span>
        </div>
        <div className="font-mono text-lg font-bold text-primary animate-pulse">
          {speed}
        </div>
      </div>

      {/* Threat Module */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-primary/70 mb-1">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> THREAT ANALYSIS</span>
        </div>
        <div className={`font-mono text-lg font-bold ${threat === 'HIGH' || threat === 'CRITICAL' ? 'text-destructive animate-ping' : 'text-primary'}`}>
          [{threat}]
        </div>
      </div>
    </div>
  );
}
