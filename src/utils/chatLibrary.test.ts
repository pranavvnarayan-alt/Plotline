/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveSessionTitle,
  deriveSessionPreview,
  upsertChatSession,
  buildSessionHistoryPayload,
} from './chatLibrary';
import { Message, ChatSession } from '../types';

describe('chatLibrary utilities', () => {
  const sampleMessages: Message[] = [
    {
      id: 'u1',
      role: 'user',
      content: 'Can you tell me about the new Clayface (2026) movie and how its reception looks on TMDB?',
      timestamp: '08:00 PM',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: 'Clayface (2026) is an upcoming DC Studios body-horror thriller written by Mike Flanagan.',
      timestamp: '08:01 PM',
      films: [
        {
          title: 'Clayface',
          release_year: 2026,
          short_synopsis: 'A B-movie actor injects a substance to stay relevant.',
        },
      ],
    },
  ];

  it('derives a clean truncated title from the first user message', () => {
    const title = deriveSessionTitle(sampleMessages);
    assert.equal(title.startsWith('Can you tell me about the new Clayface (2026)'), true);
    assert.equal(title.endsWith('...'), true);
  });

  it('derives a film-aware preview from the latest assistant turn', () => {
    const preview = deriveSessionPreview(sampleMessages);
    assert.equal(preview, 'Featured: Clayface (2026)');
  });

  it('upserts a session and moves it to the top of the library while preserving createdAt', () => {
    const existingSessions: ChatSession[] = [
      {
        id: 'session-1',
        title: 'First Chat',
        preview: 'Old preview',
        createdAt: '2026-11-04T01:00:00.000Z',
        updatedAt: '2026-11-04T01:00:00.000Z',
        persona: 'companion',
        messages: [sampleMessages[0]],
      },
      {
        id: 'session-2',
        title: 'Second Chat',
        preview: 'Another preview',
        createdAt: '2026-11-04T02:00:00.000Z',
        updatedAt: '2026-11-04T02:00:00.000Z',
        persona: 'detective',
        messages: [sampleMessages[0]],
      },
    ];

    const updated = upsertChatSession(
      existingSessions,
      'session-1',
      sampleMessages,
      'companion',
      '2026-11-04T03:00:00.000Z'
    );

    assert.equal(updated.length, 2);
    assert.equal(updated[0].id, 'session-1');
    assert.equal(updated[0].createdAt, '2026-11-04T01:00:00.000Z');
    assert.equal(updated[0].updatedAt, '2026-11-04T03:00:00.000Z');
    assert.equal(updated[0].messages.length, 2);
  });

  it('preserves full conversation memory and film card context when building history payload', () => {
    const messagesWithCardOnly: Message[] = [
      {
        id: 'u1',
        role: 'user',
        content: 'Recommend a Malayalam film.',
        timestamp: '08:00 PM',
      },
      {
        id: 'a1',
        role: 'assistant',
        content: 'Here is a great pick for your evening.',
        timestamp: '08:01 PM',
        films: [{ title: 'Aavesham', release_year: 2024 }],
      },
    ];

    const history = buildSessionHistoryPayload(messagesWithCardOnly);
    assert.equal(history.length, 2);
    assert.equal(history[1].content.includes('Aavesham (2024)'), true);
  });
});
