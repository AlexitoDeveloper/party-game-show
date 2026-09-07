# ⚡ Party Game Show Arena

Plataforma web interactiva estilo **Jackbox / Kahoot** orientada a eventos sociales con alta personalización, soporte de 2 a 6 equipos neón/arcade dinámicos y latencia inferior a 40ms.

---

## 🚀 Inicio Rápido con pnpm

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```
2. **Configurar variables (Opcional para modo demo local)**:
   Crea tu archivo `.env` basado en `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```
   *(La app incluye simulación en cliente si aún no has conectado las claves de Supabase).*

3. **Ejecutar servidor de desarrollo con acceso para móviles en red local**:
   ```bash
   pnpm dev --host
   ```

4. **Ejecutar el script SQL en Supabase**:
   Copia y pega el contenido de [src/supabase/schema.sql](file:///src/supabase/schema.sql) en el **SQL Editor** de tu consola de Supabase.

---

## 🎮 Arquitectura de Vistas

- **`/`**: Entrada con código de 4 letras o creación de sala para anfitrión.
- **`/room/[CODE]/tv`**: Pantalla gigante optimizada para 1080p/4K con código QR, columnas de equipos dinámicos y flash neón a pantalla completa al activarse el pulsador.
- **`/room/[CODE]/play`**: Mando táctil móvil con selector de equipo adaptativo, botón 3D gigante y tarjeta privada de retos.
- **`/room/[CODE]/host`**: Consola del anfitrión para cambiar de 2 a 6 equipos en caliente, resetear buzzers y sumar/restar puntos.

---

## 🎨 Paleta de Equipos Neón Soportados

1. **Rojo (`#EF4444`)**: Fuego
2. **Azul (`#3B82F6`)**: Rayo / Eléctrico
3. **Amarillo (`#FACC15`)**: Estrella / Oro
4. **Verde (`#22C55E`)**: Ácido / Neón
5. **Morado (`#A855F7`)**: Galaxia / Místico
6. **Naranja (`#F97316`)**: Solar / Magma
