/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatSession, Message, PersonaStyle } from '../types';

export const CHAT_LIBRARY_STORAGE_KEY = 'plotline-chat-library-v1';

/**
 * Generates a concise human-readable title for a chat session based on its messages.
 */
export function deriveSessionTitle(messages: Message[]): string {
  const firstUserMsg = messages.find((m) => m.role === 'user' && m.content.trim().length > 0);
  if (!firstUserMsg) {
    return 'Untitled Conversation';
  }

  const cleaned = firstUserMsg.content.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 48) {
    return cleaned;
  }
  return `${cleaned.slice(0, 45).trimEnd()}...`;
}

/**
 * Generates a preview subtitle from the latest message or recommended film cards.
 */
export function deriveSessionPreview(messages: Message[]): string {
  if (messages.length === 0) return 'No messages yet';

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.films && lastMessage.films.length > 0) {
    const filmTitles = lastMessage.films
      .map((f) => (f.release_year ? `${f.title} (${f.release_year})` : f.title))
      .join(', ');
    return `Featured: ${filmTitles}`;
  }

  const cleaned = lastMessage.content.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 72) {
    return cleaned;
  }
  return `${cleaned.slice(0, 69).trimEnd()}...`;
}

/**
 * Upserts a chat session into the ordered list of sessions (most recently updated first).
 * Ignores empty sessions with 0 messages.
 */
export function upsertChatSession(
  sessions: ChatSession[],
  sessionId: string,
  messages: Message[],
  persona: PersonaStyle,
  nowIso: string = new Date().toISOString()
): ChatSession[] {
  if (!messages || messages.length === 0) {
    return sessions;
  }

  const existing = sessions.find((s) => s.id === sessionId);
  const updatedSession: ChatSession = {
    id: sessionId,
    title: deriveSessionTitle(messages),
    preview: deriveSessionPreview(messages),
    createdAt: existing ? existing.createdAt : nowIso,
    updatedAt: nowIso,
    persona,
    messages,
  };

  const remaining = sessions.filter((s) => s.id !== sessionId);
  return [updatedSession, ...remaining];
}

/**
 * Builds the conversation history payload for `/api/chat` when continuing a chat.
 * Retains memory of both message text and any structured film cards recommended in prior turns
 * so follow-up questions ("how is it?", "where can I stream the second one?") have full context.
 */
export function buildSessionHistoryPayload(
  messages: Message[],
  maxTurns: number = 12
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.slice(-maxTurns).map((m) => {
    let enrichedContent = m.content;
    if (m.role === 'assistant' && m.films && m.films.length > 0) {
      const filmSummaries = m.films
        .map((f) => {
          const year = f.release_year ? ` (${f.release_year})` : '';
          return `${f.title}${year}`;
        })
        .join(', ');
      if (!enrichedContent.includes(m.films[0].title)) {
        enrichedContent = `${enrichedContent}\n[Recommended Films in Turn: ${filmSummaries}]`;
      }
    }
    return {
      role: m.role,
      content: enrichedContent,
    };
  });
}
