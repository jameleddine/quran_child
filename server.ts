import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// Static files in public
app.use(express.static(path.join(__dirname, 'public')));

// Gemini Client initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    time: new Date().toISOString(),
  });
});

// Endpoint: Check default audio availability
app.get('/api/audio/default-info', (_req, res) => {
  const filePath = path.join(__dirname, 'public', 'audio', 'ayat_alkursi_child.wav');
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    res.json({
      exists: true,
      sizeBytes: stats.size,
      url: '/audio/ayat_alkursi_child.wav',
    });
  } else {
    res.json({
      exists: false,
      message: 'Default audio not found on disk',
    });
  }
});

// Endpoint: Generate Custom Child Voice Recitation with Gemini TTS
app.post('/api/tts/generate', async (req, res) => {
  try {
    if (!aiClient) {
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const {
      text,
      voiceName = 'Puck',
      childAge = 6,
      style = `A sweet ${childAge}-year-old child reciting the Holy Quran with high-pitched youthful voice and clear peaceful tajweed`,
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    // Try gemini-3.8-flash-tts first for voice design, fallback to gemini-3.8-flash-lite-tts
    let response;
    try {
      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });
    } catch (primaryErr: any) {
      console.warn('Primary flash-tts error, attempting flash-lite-tts fallback:', primaryErr?.message);
      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: text }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });
    }

    const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!audioPart || !audioPart.data) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS.' });
    }

    res.json({
      success: true,
      mimeType: audioPart.mimeType || 'audio/wav',
      audioBase64: audioPart.data,
      voiceName,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate speech recitation.',
    });
  }
});

// Endpoint: Parse, Transliterate & Translate any pasted Quran Ayat
app.post('/api/quran/parse-ayah', async (req, res) => {
  try {
    const { text, customTitle } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Ayah text is required.' });
    }

    if (!aiClient) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Gemini client not initialized, using local parser',
      });
    }

    const prompt = `You are a Quran scholar and linguistics expert. 
The user has provided the following Arabic Quran text:
"${text}"

Please:
1. Identify the Surah and Ayah numbers (e.g. "Surah Al-Ikhlas 112:1-4").
2. Break the text into logical recitation segments/phrases (between 1 to 8 segments).
3. For each segment, provide:
   - "arabic": exact Quranic Arabic text with tashkeel
   - "transliteration": accurate English phonetic pronunciation guide
   - "translation": clear English translation
   - "words": array of objects { "ar": "word in arabic", "tr": "english meaning" }

Return purely valid JSON matching this schema:
{
  "surahTitle": "${customTitle || 'Quranic Ayah'}",
  "segments": [
    {
      "id": 1,
      "verseRef": "...",
      "arabic": "...",
      "transliteration": "...",
      "translation": "...",
      "words": [{"ar": "...", "tr": "..."}]
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsedJson,
    });
  } catch (error: any) {
    console.warn('AI Quran parse notice, letting client use local breakdown:', error?.message);
    res.json({
      success: false,
      error: error?.message,
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quran Shorts Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
