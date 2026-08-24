export default async function handler(req, res) {
  // ===== CORS HEADERS =====
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY no configurada en Vercel');
    return res.status(500).json({ 
      error: 'API Key no configurada en variables de entorno de Vercel' 
    });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Campo "text" requerido en el body' });
    }

    const textTrimmed = text.trim();
    if (textTrimmed.length === 0) {
      return res.status(400).json({ error: 'El texto no puede estar vacío' });
    }

    if (textTrimmed.length > 15000) {
      return res.status(400).json({ error: 'El texto es demasiado largo (máx 15000 caracteres)' });
    }

    // ===== PROMPT CORRECTOR =====
    const prompt = `Eres un corrector ortográfico y gramatical profesional especializado en documentos oficiales.

TU ÚNICA TAREA:
- Corregir errores de ortografía
- Corregir errores de gramática
- Mejorar tildes
- Mejorar puntuación si es necesario
- Mantener el tono formal y profesional

RESTRICCIONES ESTRICTAS:
- NO resumas el texto
- NO elimines párrafos ni oraciones
- NO cambies la estructura del documento
- NO agregues información nueva
- NO cambies fechas, números o datos específicos
- Devuelve el TEXTO COMPLETO idéntico en contenido, solo con correcciones

TEXTO A CORREGIR:
${textTrimmed}`;

    console.log(`[API] Iniciando corrección con gemini-3.6-flash`);

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    );

    const responseData = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Google API Error:', responseData);

      if (responseData.error?.code === 429) {
        return res.status(429).json({ 
          error: 'Límite de solicitudes alcanzado. Intenta en unos minutos.' 
        });
      }

      if (responseData.error?.message?.includes('no longer available')) {
        return res.status(503).json({ 
          error: 'Modelo de IA no disponible. Contacte al administrador.' 
        });
      }

      return res.status(500).json({
        error: responseData.error?.message || 'Error al procesar en Google API',
      });
    }

    let correctedText = null;

    if (
      responseData.candidates &&
      responseData.candidates.length > 0 &&
      responseData.candidates[0].content &&
      responseData.candidates[0].content.parts &&
      responseData.candidates[0].content.parts.length > 0
    ) {
      correctedText = responseData.candidates[0].content.parts[0].text;
    }

    if (!correctedText) {
      console.error('Respuesta vacía de Google API:', responseData);
      return res.status(500).json({ 
        error: 'Google API retornó respuesta vacía' 
      });
    }

    correctedText = correctedText.trim();

    console.log(`[API] ✅ Corrección completada exitosamente`);

    return res.status(200).json({
      success: true,
      corrected: correctedText,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en handler:', error.message, error.stack);

    if (error.message.includes('fetch')) {
      return res.status(503).json({
        error: 'Error de conectividad con Google API. Intenta de nuevo.',
      });
    }

    return res.status(500).json({
      error: `Error del servidor: ${error.message}`,
    });
  }
}
