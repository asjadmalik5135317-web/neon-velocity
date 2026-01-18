import { pgTable, text, serial, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(), // UUID for frontend reference
  status: text("status").default("active"), // active, game_over, escaped
  metadata: jsonb("metadata").default({}), // Store AI-tracked stats like 'integrity', 'speed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(), // References gameSessions.sessionId
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertSessionSchema = createInsertSchema(gameSessions).omit({ 
  id: true, 
  createdAt: true, 
  status: true,
  metadata: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});

// === API TYPES ===
export type GameSession = typeof gameSessions.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type CreateSessionResponse = {
  sessionId: string;
  message: Message;
};

export type ActionRequest = {
  action: string;
};

export type ActionResponse = {
  message: Message;
  metadata?: Record<string, any>; // Updated game stats
  status?: string;
};

export type HistoryResponse = {
  session: GameSession;
  messages: Message[];
};
