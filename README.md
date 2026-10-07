# Gestión de Turnos - Salón de Belleza (MVP)

Herramienta interna para que el equipo de un salón de belleza gestione los turnos del día a día. Los empleados pueden ver rápidamente qué citas hay, crear y editar turnos sin solapamientos, cambiar el estado de las citas y tener un resumen visual del día.

## Requisitos

- Node.js y npm.
- Una URL de API compatible con los endpoints `/appointments` y `/services`.

## Cómo correr el proyecto

1. Clona el repositorio:

   ```bash
   git clone https://github.com/EstreFlores/Gesti-n-de-Turnos-MVP-Frontend.git
   cd Gesti-n-de-Turnos-MVP-Frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura la URL de la API copiando la plantilla:

   ```bash
   cp .env.example .env.local
   ```

   En Windows PowerShell también puedes usar:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Ajusta `VITE_API_URL` en `.env.local` si usarás otra API. No agregues secretos a variables `VITE_*`, porque se incluyen en el código enviado al navegador. `.env.local` es local y no debe subirse al repositorio.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Si cambias `.env.local` mientras Vite está ejecutándose, reinicia el servidor.

## Comprobaciones

```bash
npm run lint
npm run build
```
