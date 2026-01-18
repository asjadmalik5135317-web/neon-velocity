import { z } from 'zod';
import { insertMessageSchema, gameSessions, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  game: {
    start: {
      method: 'POST' as const,
      path: '/api/game/start',
      responses: {
        201: z.object({
          sessionId: z.string(),
          message: z.custom<typeof messages.$inferSelect>(),
        }),
        500: errorSchemas.internal,
      },
    },
    action: {
      method: 'POST' as const,
      path: '/api/game/:sessionId/action',
      input: z.object({
        action: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.custom<typeof messages.$inferSelect>(),
          metadata: z.record(z.any()).optional(),
          status: z.string().optional(),
        }),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/game/:sessionId',
      responses: {
        200: z.object({
          session: z.custom<typeof gameSessions.$inferSelect>(),
          messages: z.array(z.custom<typeof messages.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
