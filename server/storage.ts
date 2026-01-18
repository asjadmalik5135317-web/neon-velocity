import { db } from "./db";
import { gameSessions, messages, type GameSession, type Message, type InsertMessage } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(): Promise<GameSession>;
  getSession(sessionId: string): Promise<GameSession | undefined>;
  updateSessionMetadata(sessionId: string, metadata: Record<string, any>): Promise<GameSession>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async createSession(): Promise<GameSession> {
    const sessionId = randomUUID();
    const [session] = await db
      .insert(gameSessions)
      .values({ sessionId, metadata: { integrity: 100, heat: 0, speed: 0 } })
      .returning();
    return session;
  }

  async getSession(sessionId: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionId, sessionId));
    return session;
  }

  async updateSessionMetadata(sessionId: string, metadata: Record<string, any>): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set({ metadata })
      .where(eq(gameSessions.sessionId, sessionId))
      .returning();
    return session;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt));
  }
}

export const storage = new DatabaseStorage();
