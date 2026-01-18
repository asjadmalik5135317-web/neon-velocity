import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useGameSession(sessionId: string | null) {
  return useQuery({
    queryKey: [api.game.history.path, sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const url = buildUrl(api.game.history.path, { sessionId });
      const res = await fetch(url);
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("System Failure: Connection Lost");
      
      const data = await res.json();
      return api.game.history.responses[200].parse(data);
    },
    enabled: !!sessionId,
    refetchInterval: 5000, // Poll for updates occasionally
  });
}

export function useStartGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.game.start.path, {
        method: api.game.start.method,
      });
      
      if (!res.ok) throw new Error("Initialization Failed");
      
      const data = await res.json();
      return api.game.start.responses[201].parse(data);
    },
    onSuccess: (data) => {
      toast({
        title: "SYSTEM INITIALIZED",
        description: "Neural link established. Good luck, Runner.",
        className: "border-primary text-primary font-mono",
      });
      setLocation(`/game/${data.sessionId}`);
    },
    onError: () => {
      toast({
        title: "CRITICAL ERROR",
        description: "Could not initialize game sequence.",
        variant: "destructive",
      });
    },
  });
}

export function useGameAction(sessionId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: string) => {
      const url = buildUrl(api.game.action.path, { sessionId });
      const validated = api.game.action.input.parse({ action });
      
      const res = await fetch(url, {
        method: api.game.action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Session terminated");
        throw new Error("Command transmission failed");
      }

      const data = await res.json();
      return api.game.action.responses[200].parse(data);
    },
    onSuccess: (data) => {
      // Invalidate the session query to refresh full history if needed
      // But we can also optimistically update if we want to be fancy
      queryClient.invalidateQueries({ queryKey: [api.game.history.path, sessionId] });
    },
    onError: (error) => {
      toast({
        title: "COMMAND REJECTED",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
