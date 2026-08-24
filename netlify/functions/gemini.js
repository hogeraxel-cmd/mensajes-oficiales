exports.handler = async function(event, context) {
  // Evitar accesos no permitidos (solo acepta POST)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // La API KEY se configura en el panel de Netlify, NO en el código
  const apiKey = process.env.GEMINI_API_KEY; 
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API Key no configurada en el servidor" }) };
  }

  try {
    const { text } = JSON.parse(event.body);
    
    // Prompt estructurado para la labor policial
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
        generationConfig: { temperature: 0.2 } // Baja temperatura para respuestas conservadoras y precisas
      })
    });

    const data = await response.json();
    const correctedText = data.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corrected: correctedText })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo en la comunicación con la IA" })
    };
  }
};