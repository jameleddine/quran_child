import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, customTitle } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Ayah text is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY is not configured on Vercel environment variables, using client local parser',
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

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
    return res.status(200).json({
      success: true,
      data: parsedJson,
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      error: error?.message || 'Failed to parse ayah',
    });
  }
}
