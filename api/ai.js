export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la API Key en Vercel.' });
  }

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Sin texto.' });

    const prompt = `Actúa como un corrector de redacción policial para Carabineros de Chile. Corrige la ortografía y gramática manteniendo un tono formal y técnico. No inventes datos. Texto: ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Error de Google' });
    }

    return res.status(200).json({ corrected: data.candidates[0].content.parts[0].text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
