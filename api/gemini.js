// La clave web de Firebase es pública (es la misma de index.html); se usa solo para validar sesiones.
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyB7EJn3DjG4tsdU2-8m15uhRaD2PSlnUrg';
// El modelo se puede cambiar desde las variables de entorno de Vercel sin tocar el código.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const DOMINIO_INSTITUCIONAL = '@carabineros.cl';
const MAX_CARACTERES = 8000;

// ===== VALIDACIÓN DE SESIÓN =====
// Solo usuarios con sesión activa, correo institucional y correo verificado pueden usar la IA.
async function verificarUsuario(req) {
  const header = req.headers.authorization || '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!idToken) {
    return { status: 401, error: 'Sesión requerida. Vuelve a ingresar a la aplicación.' };
  }

  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  const data = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    const motivo = data.error?.message || '';
    if (motivo.includes('INVALID_ID_TOKEN') || motivo.includes('TOKEN_EXPIRED') || motivo.includes('USER_NOT_FOUND')) {
      return { status: 401, error: 'Sesión inválida o expirada. Vuelve a ingresar a la aplicación.' };
    }
    console.error('[API] Error validando sesión con Firebase:', data);
    return { status: 500, error: 'No se pudo validar la sesión. Contacte al administrador.' };
  }

  const user = data.users && data.users[0];
  const email = (user?.email || '').toLowerCase();
  if (!user || !user.emailVerified || !email.endsWith(DOMINIO_INSTITUCIONAL)) {
    return { status: 403, error: 'Acceso restringido a correos institucionales verificados.' };
  }

  return { user };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY no configurada en Vercel');
    return res.status(500).json({ error: 'Servicio de IA no configurado. Contacte al administrador.' });
  }

  try {
    const sesion = await verificarUsuario(req);
    if (sesion.error) {
      return res.status(sesion.status).json({ error: sesion.error });
    }

    const { text } = req.body || {};

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'El texto no puede estar vacío' });
    }

    const textTrimmed = text.trim();
    if (textTrimmed.length > MAX_CARACTERES) {
      return res.status(400).json({ error: `El relato es demasiado largo (máx ${MAX_CARACTERES} caracteres)` });
    }

    // ===== PROMPT CORRECTOR =====
    const prompt = `Eres un corrector de redacción policial para Carabineros de Chile.

TU TAREA:
- Corregir ortografía, tildes, gramática y puntuación.
- Mejorar la claridad del relato manteniendo un tono formal, objetivo y técnico, en orden cronológico.

RESTRICCIONES ESTRICTAS:
- NO inventes, agregues ni elimines hechos, personas, lugares, horas, cantidades ni datos.
- NO resumas: conserva toda la información del texto original.
- NO cambies fechas, números, direcciones ni patentes.
- Conserva EXACTAMENTE, sin modificar, las marcas entre corchetes como [DATO_1]; reemplazan datos personales protegidos.
- Conserva los asteriscos (*) si existen.
- Devuelve ÚNICAMENTE el texto corregido, sin introducciones, comentarios, comillas ni formato Markdown.

TEXTO A CORREGIR:
"""
${textTrimmed}
"""`;

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            topP: 0.95,
            topK: 40,
          },
          // Los relatos describen delitos; sin esto el modelo puede bloquear textos legítimos.
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const responseData = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Google API Error:', responseData);

      if (responseData.error?.code === 429) {
        return res.status(429).json({ error: 'Límite de solicitudes alcanzado. Intenta en unos minutos.' });
      }

      if (responseData.error?.code === 404 || responseData.error?.message?.includes('no longer available')) {
        return res.status(503).json({ error: 'Modelo de IA no disponible. Contacte al administrador.' });
      }

      return res.status(502).json({ error: 'Error al procesar el texto con la IA. Intenta nuevamente.' });
    }

    const candidate = responseData.candidates?.[0];

    if (candidate?.finishReason === 'MAX_TOKENS') {
      return res.status(422).json({ error: 'El relato es demasiado largo para corregirlo de una vez. Divídelo en partes.' });
    }

    // Se ignoran las partes de "razonamiento" que algunos modelos incluyen en la respuesta
    let correctedText = (candidate?.content?.parts || [])
      .filter(p => typeof p.text === 'string' && !p.thought)
      .map(p => p.text)
      .join('')
      .trim();

    // Quita bloques de código Markdown si el modelo los agregó
    correctedText = correctedText.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '').trim();

    if (!correctedText) {
      console.error('Respuesta vacía de Google API:', responseData);
      return res.status(502).json({ error: 'La IA no devolvió texto. Intenta nuevamente.' });
    }

    return res.status(200).json({
      success: true,
      corrected: correctedText,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en handler:', error.message, error.stack);
    return res.status(503).json({ error: 'Error de conectividad con el servicio de IA. Intenta de nuevo.' });
  }
}
