/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { chatWithPlotline, generateSpeechAudio } from './src/server/geminiClient';
import { getSavedPreferences, savePreferences, deleteSavedPreferences } from './src/server/preferencesStore';
import { INITIAL_TEST_SCENARIOS, executeTestScenario } from './src/server/testScenarios';
import { discover2025Films } from './src/server/tmdb';
import { isOpenRouterConfigured, getOpenRouterModel } from './src/server/openRouterClient';
import { SystemStatus } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests with 10MB cap for base64 image uploads
app.use(express.json({ limit: '10mb' }));

// ----------------- API ROUTES -----------------

/**
 * Main chat discovery endpoint
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, persona, userRegion, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image attachment is required.' });
    }

    // Server-side validation for image uploads
    if (image) {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(image.mimeType)) {
        return res.status(400).json({
          error: `Unsupported image format (${image.mimeType}). Please upload a JPEG, PNG, or WebP image.`,
        });
      }

      // Max size approx 5MB (Base64 length ~ 7MB)
      if (image.base64Data && image.base64Data.length > 7 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Image file exceeds the 5MB size limit. Please upload a smaller image.',
        });
      }
    }

    const result = await chatWithPlotline({
      message: message || 'Please analyze this film image and describe what clues or movie it might be.',
      history: history || [],
      persona: persona || 'companion',
      userRegion: userRegion || 'IN',
      image,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while connecting to Plotline model service.',
    });
  }
});

/**
 * Text-to-speech endpoint using gemini-3.8-flash-lite-tts
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required.' });
    }

    const audioResult = await generateSpeechAudio(text);
    if (!audioResult) {
      return res.status(503).json({
        error: 'Speech generation unavailable. Please use browser speech or read text.',
      });
    }

    res.json(audioResult);
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed.' });
  }
});

/**
 * Developer Diagnostics & Status endpoint (Safe: never leaks secrets or full prompts)
 */
app.get('/api/status', (_req: Request, res: Response) => {
  const isOR = isOpenRouterConfigured();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('sk-or-'));

  const status: SystemStatus = {
    gemini_configured: hasGemini,
    openrouter_configured: isOR,
    active_provider: isOR ? 'openrouter' : 'google',
    model_name: isOR ? getOpenRouterModel() : 'gemini-3.8-flash',
    tmdb_configured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim() !== ''),
    apify_configured: Boolean(process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.trim() !== ''),
    voice_status: {
      available: true,
      mode: isOR ? 'Browser Web Speech Synthesis + Dictation' : 'Gemini 3.8 Flash Lite TTS + Browser Speech Recognition',
      note: isOR
        ? 'OpenRouter active: speech playback provided via browser Web Speech API.'
        : 'Truthful audio synthesis with Kore voice persona; browser speech dictation with graceful text fallback.',
    },
    system_prompt_version: 'v0.1-2026-10-28',
    server_timestamp: new Date().toISOString(),
  };

  res.json(status);
});

/**
 * Endpoint to retrieve verified films released after January 2025 from live TMDB catalog
 */
app.get('/api/tmdb/discover-2025', async (req: Request, res: Response) => {
  try {
    const region = (req.query.region as string) || 'IN';
    const films = await discover2025Films(region);
    res.json({
      configured: Boolean(process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim() !== ''),
      films,
      notice: process.env.TMDB_API_KEY
        ? 'Live TMDB catalog connected for post-January 2025 releases.'
        : 'TMDB_API_KEY not configured. To extend live access for films after January 2025, add TMDB_API_KEY in the AI Studio Secrets panel.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch 2025 releases.' });
  }
});

/**
 * Preferences endpoints: opt-in, inspect, update, delete
 */
app.get('/api/preferences', (_req: Request, res: Response) => {
  res.json(getSavedPreferences());
});

app.post('/api/preferences', (req: Request, res: Response) => {
  const updated = savePreferences(req.body);
  res.json(updated);
});

app.delete('/api/preferences', (_req: Request, res: Response) => {
  deleteSavedPreferences();
  res.json({ success: true, message: 'All saved preferences permanently removed.' });
});

/**
 * Test scenarios endpoints for 06_TEST_EVALUATE_IMPROVE.md
 */
app.get('/api/scenarios', (_req: Request, res: Response) => {
  res.json(INITIAL_TEST_SCENARIOS);
});

app.post('/api/scenarios/run', async (req: Request, res: Response) => {
  const { scenarioId } = req.body;
  if (!scenarioId) {
    return res.status(400).json({ error: 'scenarioId is required' });
  }

  try {
    const executed = await executeTestScenario(scenarioId);
    res.json(executed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to execute test scenario' });
  }
});

// ----------------- VITE INTEGRATION -----------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plotline server running at http://0.0.0.0:${PORT}`);
  });
}

export { app };
export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start Plotline server:', err);
    process.exit(1);
  });
}
