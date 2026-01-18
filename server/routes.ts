import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/image/client"; // Reusing the client from integration

const SYSTEM_PROMPT = `
The year is 2088. You are the Game Master for a text adventure game set in New Kyoto, a vertical cyberpunk city.
The player is a Street Runner who just stole an Aether-7 prototype car (phase-shifting capability).
The goal is to escape the Neon District (top level) to the lower transit lines (bottom level).

Current Situation:
- Location: Top level of Neon District.
- Threat: High-Speed Patrol (HSP) sirens screaming behind.
- Immediate Obstacle: A 40-story jump to the lower transit lines.
- Car Status: Dashboard glowing red.

Your Role:
1. React to the player's actions dynamically.
2. Be descriptive, immersive, and fast-paced. Use cyberpunk slang (choom, delta, nova, chrome, zeroed).
3. Track the car's status (Integrity, Heat, Speed).
4. Provide a JSON block at the end of your response with the updated stats.

Format your response exactly like this:
[Narrative text describing the outcome and new situation]

JSON_STATS: {"integrity": number, "heat": number, "speed": number, "status": "active" | "game_over" | "escaped"}
`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // POST /api/game/start
  app.post(api.game.start.path, async (req, res) => {
    try {
      const session = await storage.createSession();
      
      const initialPrompt = "The dashboard glows red. What do you do?";
      
      // We don't need to call AI for the very first prompt as it's static, 
      // but let's seed the AI context with the system prompt and this initial state.
      
      const systemMsg = { sessionId: session.sessionId, role: "system", content: SYSTEM_PROMPT };
      await storage.createMessage(systemMsg);

      const assistantMsg = { sessionId: session.sessionId, role: "assistant", content: initialPrompt };
      const savedMsg = await storage.createMessage(assistantMsg);

      res.status(201).json({ sessionId: session.sessionId, message: savedMsg });
    } catch (error) {
      console.error("Start game error:", error);
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  // POST /api/game/:sessionId/action
  app.post(api.game.action.path, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { action } = api.game.action.input.parse(req.body);

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Save user action
      await storage.createMessage({ sessionId, role: "user", content: action });

      // Get history
      const history = await storage.getMessages(sessionId);
      const messages = history.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));

      // Call AI
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: messages,
        max_tokens: 500,
      });

      const aiTextRaw = response.choices[0].message.content || "System Malfunction...";
      
      // Parse Stats
      let narrative = aiTextRaw;
      let newStats = session.metadata as Record<string, any>;
      let status = "active";

      const jsonMatch = aiTextRaw.match(/JSON_STATS:\s*({.*})/);
      if (jsonMatch) {
        try {
          const stats = JSON.parse(jsonMatch[1]);
          newStats = { ...newStats, ...stats };
          status = stats.status || "active";
          narrative = aiTextRaw.replace(jsonMatch[0], "").trim();
          
          await storage.updateSessionMetadata(sessionId, newStats);
        } catch (e) {
          console.error("Failed to parse AI stats:", e);
        }
      }

      // Save AI response
      const savedMsg = await storage.createMessage({ sessionId, role: "assistant", content: narrative });

      res.json({ message: savedMsg, metadata: newStats, status });

    } catch (error) {
      console.error("Action error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // GET /api/game/:sessionId
  app.get(api.game.history.path, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const messages = await storage.getMessages(sessionId);
      // Filter out system messages for the frontend
      const visibleMessages = messages.filter(m => m.role !== 'system');
      
      res.json({ session, messages: visibleMessages });
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
