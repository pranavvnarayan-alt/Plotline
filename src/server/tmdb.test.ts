import test from 'node:test';
import assert from 'node:assert';
import {
  getTMDBApiKey,
  getWatchmodeApiKey,
  lookupLiveMovieContext,
  extractCandidateTitle,
  extractSubjectFromHistory,
  isFollowUpQuery,
} from './tmdb';

test('getTMDBApiKey and getWatchmodeApiKey resolve configured secrets accurately', () => {
  const originalImdb = process.env.ImDb_KEY;
  const originalTmdb = process.env.TMDB_API_KEY;
  const originalWatchmode = process.env.Platform_identification_KEY;

  try {
    delete process.env.TMDB_API_KEY;
    process.env.ImDb_KEY = 'test_tmdb_key_from_user';
    assert.strictEqual(getTMDBApiKey(), 'test_tmdb_key_from_user');

    delete process.env.ImDb_KEY;
    process.env.TMDB_API_KEY = 'standard_tmdb_key';
    assert.strictEqual(getTMDBApiKey(), 'standard_tmdb_key');

    process.env.Platform_identification_KEY = 'test_watchmode_key';
    assert.strictEqual(getWatchmodeApiKey(), 'test_watchmode_key');
  } finally {
    if (originalImdb !== undefined) {
      process.env.ImDb_KEY = originalImdb;
    } else {
      delete process.env.ImDb_KEY;
    }
    if (originalTmdb !== undefined) {
      process.env.TMDB_API_KEY = originalTmdb;
    } else {
      delete process.env.TMDB_API_KEY;
    }
    if (originalWatchmode !== undefined) {
      process.env.Platform_identification_KEY = originalWatchmode;
    } else {
      delete process.env.Platform_identification_KEY;
    }
  }
});

test('extractCandidateTitle extracts multi-word titles and ignores follow-up questions like "how is it?"', () => {
  const res1 = extractCandidateTitle('Tell me about "The End of Oak Street"');
  assert.strictEqual(res1.title, 'The End of Oak Street');

  const res2 = extractCandidateTitle('Tell me about The End of Oak Street 2026');
  assert.strictEqual(res2.title, 'The End of Oak Street');
  assert.strictEqual(res2.year, '2026');

  const res3 = extractCandidateTitle('What is the plot of the movie Clayface?');
  assert.strictEqual(res3.title, 'Clayface');

  const res4 = extractCandidateTitle('hellooo!! can you tell me about the new Clayface (2026) movie? How is it?');
  assert.strictEqual(res4.title, 'Clayface');
  assert.strictEqual(res4.year, '2026');

  // Short follow-ups should return null so history subject resolution takes over cleanly
  assert.strictEqual(isFollowUpQuery('how is it?'), true);
  assert.strictEqual(isFollowUpQuery('how was it?'), true);
  assert.strictEqual(isFollowUpQuery('where can I watch it?'), true);
  assert.strictEqual(isFollowUpQuery('should I watch it?'), true);
  assert.strictEqual(extractCandidateTitle('how is it?').title, null);
  assert.strictEqual(extractCandidateTitle('how was it?').title, null);

  // Explicit lowercase/quoted titles in opinion & follow-up questions must extract the exact title
  const res5 = extractCandidateTitle("what's your opinion on life is beautiful? should I watch it?");
  assert.strictEqual(res5.title?.toLowerCase(), 'life is beautiful');

  const res6 = extractCandidateTitle("what's 'life is beautiful' about?");
  assert.strictEqual(res6.title?.toLowerCase(), 'life is beautiful');

  const res7 = extractCandidateTitle('is life is beautiful worth watching?');
  assert.strictEqual(res7.title?.toLowerCase(), 'life is beautiful');

  const res8 = extractCandidateTitle('Tell me about Life is Beautiful');
  assert.strictEqual(res8.title?.toLowerCase(), 'life is beautiful');
});

test('extractSubjectFromHistory resolves **Clayface** (2026) and **Life Is Beautiful** instead of crew names or later secondary movies', () => {
  const mockHistory = [
    {
      role: 'user',
      content: 'hellooo!! can you tell me about the new Clayface (2026) movie?',
    },
    {
      role: 'assistant',
      content:
        "Hey there! I'd love to share the details on **Clayface** (2026)—it sounds like a genuinely dark, tragic take on one of Gotham's most iconic villains.\n\nDirected by **James Watkins** from a script by **Mike Flanagan** and **Hossein Amini**, the film stars **Tom Rhys Harries** as Matt Hagen alongside **Naomi Ackie**.",
    },
  ];

  const subject = extractSubjectFromHistory(mockHistory);
  assert.ok(subject, 'Expected subject from history');
  assert.strictEqual(subject.title, 'Clayface');
  assert.strictEqual(subject.year, '2026');

  // Even if a later paragraph mentions a secondary movie with a year like **A Bug's Life** (1998),
  // extractSubjectFromHistory must prioritize the user's requested movie / opening paragraph subject (**Life Is Beautiful**)
  const lifeIsBeautifulHistory = [
    {
      role: 'user',
      content: "tell me about the movie 'life is beautiful'",
    },
    {
      role: 'assistant',
      content:
        "**Life Is Beautiful** is an unforgettable 1997 Italian tragicomedy directed by and starring **Roberto Benigni** as Guido Orefice.\n\nIf you enjoy stories where wit and imagination protect a community, you might also like **A Bug's Life** (1998).",
    },
  ];

  const lifeSubject = extractSubjectFromHistory(lifeIsBeautifulHistory);
  assert.ok(lifeSubject, 'Expected Life Is Beautiful subject from history');
  assert.strictEqual(lifeSubject.title.toLowerCase(), 'life is beautiful');
});

test('lookupLiveMovieContext resolves Clayface (2026) and Life Is Beautiful (1997) on initial and follow-up queries with TMDB & Watchmode data', async () => {
  const apiKey = getTMDBApiKey();
  if (!apiKey) {
    const result = await lookupLiveMovieContext('Tell me about Clayface 2026 film');
    assert.strictEqual(result, null);
    return;
  }

  // 1. Initial query for Clayface (2026)
  const result = await lookupLiveMovieContext('hellooo!! can you tell me about the new Clayface (2026) movie? How is it?');
  assert.ok(result, 'Expected result for Clayface query');
  assert.ok(result.contextPrompt.includes('Clayface'), 'Context prompt should contain Clayface');
  assert.ok(result.contextPrompt.includes('Matt Hagen'), 'Context prompt should contain verified Matt Hagen synopsis');
  assert.strictEqual(result.matchedMovie?.title, 'Clayface');
  assert.strictEqual(result.matchedMovie?.release_year, 2026);

  // 2. Follow-up query "how is it?" after assistant's reply mentioning Mike Flanagan & Tom Rhys Harries
  const followUpResult = await lookupLiveMovieContext('how is it?', 'IN', [
    {
      role: 'user',
      content: 'hellooo!! can you tell me about the new Clayface (2026) movie?',
    },
    {
      role: 'assistant',
      content:
        "Hey there! I'd love to share the details on **Clayface** (2026)—it sounds like a genuinely dark, tragic take on one of Gotham's most iconic villains. Directed by James Watkins and written by Mike Flanagan and Hossein Amini, it stars Tom Rhys Harries as Matt Hagen.",
    },
  ]);

  assert.ok(followUpResult, 'Expected follow-up lookup result');
  assert.strictEqual(
    followUpResult.matchedMovie?.title,
    'Clayface',
    'Follow-up must stay locked on Clayface and NOT switch to The Exorcist: Martyrs'
  );
  assert.ok(
    followUpResult.contextPrompt.includes('FOLLOW-UP CONTEXT LOCK'),
    'Follow-up context prompt should include FOLLOW-UP CONTEXT LOCK directive'
  );
  assert.ok(
    followUpResult.contextPrompt.includes('Live Verified TMDB Audience & Critic Reviews'),
    'Follow-up context prompt should include live TMDB review snippets'
  );

  // 3. Follow-up query "what's your opinion on life is beautiful? should I watch it?"
  const lifeFollowUp = await lookupLiveMovieContext(
    "what's your opinion on life is beautiful? should I watch it?",
    'IN',
    [
      {
        role: 'user',
        content: "tell me about the movie 'life is beautiful'",
      },
      {
        role: 'assistant',
        content:
          "**Life Is Beautiful** is a deeply moving 1997 Italian classic directed by **Roberto Benigni**. Another lighthearted story from that era is **A Bug's Life** (1998).",
      },
    ]
  );

  assert.ok(lifeFollowUp, 'Expected live lookup result for Life Is Beautiful follow-up');
  assert.strictEqual(
    lifeFollowUp.matchedMovie?.title,
    'Life Is Beautiful',
    'Must resolve to Life Is Beautiful (1997) and NEVER A Bug\'s Life'
  );
  assert.strictEqual(lifeFollowUp.matchedMovie?.release_year, 1997);
});



