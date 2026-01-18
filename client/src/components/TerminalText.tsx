import { motion } from "framer-motion";

interface TerminalTextProps {
  text: string;
  role: "assistant" | "user" | "system";
  isNew?: boolean;
}

export function TerminalText({ text, role, isNew = false }: TerminalTextProps) {
  // Color coding based on role
  const roleColors = {
    assistant: "text-primary/90 drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]",
    user: "text-destructive drop-shadow-[0_0_8px_rgba(255,64,64,0.3)] text-right italic",
    system: "text-yellow-400 font-bold uppercase tracking-widest text-center border-y border-yellow-400/20 py-2 my-4 bg-yellow-400/5",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const typingVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: { 
        duration: Math.min(text.length * 0.02, 2), // Cap typing speed
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={isNew ? "hidden" : "visible"}
      animate="visible"
      className={`mb-4 max-w-3xl ${role === "user" ? "ml-auto" : "mr-auto"}`}
    >
      <div className={`font-mono text-sm md:text-base leading-relaxed ${roleColors[role]}`}>
        {role === "assistant" && <span className="mr-2 text-xs opacity-50">[AI-NODE]:</span>}
        {role === "user" && <span className="mr-2 text-xs opacity-50">[RUNNER]:</span>}
        {role === "system" && <span className="mr-2 text-xs opacity-50">[SYSTEM]:</span>}
        
        <span className="whitespace-pre-wrap">{text}</span>
      </div>
    </motion.div>
  );
}
