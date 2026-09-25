import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY is not configured on Vercel environment variables',
      });
    }

    const {
      text,
      voiceName = 'Puck',
      childAge = 6,
      style = `A sweet ${childAge}-year-old child reciting the Holy Quran with high-pitched youthful voice and clear peaceful tajweed`,
    } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

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
                speechMetadata: { style: style },
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
      response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [{ role: 'user', parts: [{ text: text }] }],
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
      return res.status(200).json({
        success: false,
        error: 'No audio returned from Gemini TTS.',
      });
    }

    return res.status(200).json({
      success: true,
      mimeType: audioPart.mimeType || 'audio/wav',
      audioBase64: audioPart.data,
      voiceName,
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      error: error?.message || 'Failed to generate speech recitation.',
    });
  }
}
