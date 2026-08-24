export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key no configurada en Vercel' });
  }

  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Texto vacío' });
    }

    const prompt = `Eres un corrector de redacción policial experto. Corrige SOLO ortografía y gramática manteniendo tono formal. No inventes datos.\n\nTexto original:\n${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return res.status(500).json({ 
        error: data.error?.message || 'Error en Google API' 
      });
    }

    const corrected = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!corrected) {
      return res.status(500).json({ error: 'Respuesta vacía de Google API' });
    }

    return res.status(200).json({ corrected });

  } catch (error) {
    console.error('Error en handler:', error);
    return res.status(500).json({ 
      error: `Error del servidor: ${error.message}` 
    });
  }
}
