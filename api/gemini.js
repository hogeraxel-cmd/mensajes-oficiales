export default async function handler(req, res) {
  // ===== CORS HEADERS =====
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, PATCH, DELETE, POST, PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Maneja preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo acepta POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo POST.' });
  }

  // ===== VALIDACIÓN DE API KEY =====
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY no configurada en Vercel');
    return res.status(500).json({ 
      error: 'API Key no configurada en variables de entorno de Vercel' 
    });
  }

  try {
    // ===== VALIDACIÓN DE ENTRADA =====
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Campo "text" requerido en el body' });
    }

    const textTrimmed = text.trim();
    if (textTrimmed.length === 0) {
      return res.status(400).json({ error: 'El texto no puede estar vacío' });
    }

    if (textTrimmed.length > 10000) {
      return res.status(400).json({ error: 'El texto es demasiado largo (máx 10000 caracteres)' });
    }

    // ===== PROMPT POLICIAL =====
    const prompt = `Eres un corrector de redacción especializado en documentos policiales de Carabineros de Chile.

INSTRUCCIONES:
1. Corrige SOLO ortografía, tildes y gramática
2. Mantén el tono formal y técnico
3. No inventes ni agregues información
4. Preserva la estructura del documento
5. Devuelve el texto corregido sin explicaciones adicionales

TEXTO ORIGINAL:
${textTrimmed}

TEXTO CORREGIDO:`;

    // ===== LLAMADA A GOOGLE GEMINI API =====
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
            temperature: 0.2,
            maxOutputTokens: 2000,
            topP: 0.9,
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

    // ===== MANEJO DE RESPUESTA =====
    const responseData = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Google API Error:', responseData);

      // Mensajes de error específicos
      if (responseData.error?.code === 429) {
        return res.status(429).json({ 
          error: 'Límite de solicitudes alcanzado. Intenta en unos minutos.' 
        });
      }

      if (responseData.error?.message?.includes('gemini-3.6-flash is no longer available')) {
        return res.status(503).json({ 
          error: 'Modelo de IA no disponible. Contáctenos para actualizar.' 
        });
      }

      return res.status(500).json({
        error: responseData.error?.message || 'Error al procesar en Google API',
      });
    }

    // ===== EXTRACCIÓN DEL RESULTADO =====
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

    // Limpia espacios en blanco
    correctedText = correctedText.trim();

    console.log(`[API] ✅ Corrección completada exitosamente`);

    // ===== RESPUESTA EXITOSA =====
    return res.status(200).json({
      success: true,
      corrected: correctedText,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en handler:', error.message, error.stack);

    // Errores de red
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
