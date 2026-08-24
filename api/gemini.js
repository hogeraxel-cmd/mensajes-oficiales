export default async function handler(req, res) {
  // Evitar métodos no permitidos
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key no configurada' });
  }

  try {
    const { text } = req.body;
    
    const prompt = `Actúa como un corrector de redacción policial para Carabineros de Chile. 
    Tu objetivo es corregir la ortografía, gramática y coherencia del siguiente texto de procedimiento policial, manteniendo un tono formal, objetivo y técnico. 
    NO inventes datos, NO cambies los hechos, NO alteres la estructura de los asteriscos (*) que marcan negritas en WhatsApp. Solo mejora la redacción del relato narrativo.
    
    Texto a corregir:
    ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    const correctedText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ corrected: correctedText });

  } catch (error) {
    return res.status(500).json({ error: 'Fallo en la comunicación con la IA' });
  }
}
