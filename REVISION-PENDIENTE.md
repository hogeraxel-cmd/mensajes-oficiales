# Revisión pendiente (2026-10-10)

Observaciones de la revisión del código, para trabajarlas en otra sesión.

## Problemas que conviene arreglar

1. **Sin señal la app no abre.** `sw.js` guarda en caché `index.html`, pero no las librerías de Firebase que se cargan desde gstatic (`index.html`, líneas 14-16). Sin conexión, `firebase` no existe y la app se cae al iniciar. Además, guardar sin señal deja el botón en "Guardando..." indefinidamente, porque Firestore no tiene activada la persistencia offline. El borrador local sí se conserva.
2. **La protección de datos ante la IA tiene huecos** (`protegerDatos` en `index.html`). Solo oculta el nombre completo y la forma "nombre + primer apellido". Llegan a Gemini sin ocultar:
   - apellidos sueltos ("el detenido Pérez")
   - nombres de pila sueltos
   - patentes
   - pasaportes
   - teléfonos fijos
   - direcciones

   Otro punto: si la clave de Gemini es del plan gratuito, Google puede usar los textos enviados para mejorar sus productos. Con datos policiales conviene usar el plan de pago.
3. **La API no tiene límite de uso por usuario** (`api/gemini.js`). Cualquier cuenta verificada puede llamarla sin límite y el consumo de Gemini corre por cuenta del dueño.
4. **No hay "Olvidé mi clave".** Quien pierda la contraseña no puede recuperarla desde la app.

## Detalles menores

- **Se pierde una casilla al cambiar de módulo:** si en un WhatsApp se aprieta "Generar Mensaje a OS1" y luego "Modificar Datos", se pierde la marca "Se informa a OS1".
- **Eliminar no avisa si falla:** `deleteMsg` no maneja errores, así que un fallo de red no muestra ningún mensaje.
- **Modelo de Gemini por defecto:** está como `gemini-3.6-flash` (`api/gemini.js`). Confirmar que existe o que `GEMINI_MODEL` está definido en Vercel.
- **Zoom bloqueado:** `user-scalable=no` impide hacer zoom en el teléfono.
- **Login sin Enter:** al apretar Enter en el formulario no se ingresa.
- **Faltan archivos de repositorio:** no hay README ni `.gitignore`.

## Orden propuesto

Empezar por el 1 (funcionar sin señal) y el 2 (reforzar los datos que se ocultan a la IA).
