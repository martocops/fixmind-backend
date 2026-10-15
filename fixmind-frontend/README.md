# FixMind
Interfaz de usuario para el sistema de diagnóstico y reparación.

## Equipo
- Pedro Ángel Zarzosa Piza
- [Nombre de tu compañero]

## Tecnologías
- Backend: (Node + Express - En repositorio del servidor)
- Base de datos: (PostgreSQL/MySQL - En repositorio del servidor)
- Frontend: (React 19, Vite, HTML, CSS, JS)
- API de terceros: (N/A)

## Requisitos previos
- Node.js v20 o superior
- Servidor backend en ejecución

## Instalación
1. Clonar el repositorio: `git clone https://github.com/martocops/fixmind-backend.git`
2. Entrar al frontend: `cd fixmind-frontend`
3. Instalar dependencias: `npm install`
4. Copiar `.env.example` a `.env` y completar los valores
5. Iniciar el servidor de desarrollo: `npm run dev`
6. Abrir el frontend en `http://localhost:5173`

## Variables de entorno
| Variable |     Descripción     | Ejemplo |
|----------|-------------------- |---------|
| VITE_API_URL | URL base de la API | http://localhost:8000/api |

## Endpoints
| Método |     Ruta    |  Descripción | Códigos de respuesta |
|--------|-------------|--------------|----------------------|
| GET    | /api/diagnosticos | Lista problemas |       200            |
*(Nota: La lógica de rutas y BD está configurada en el backend).*

## Pruebas
Colección de Postman en la carpeta `docs/` del repositorio Backend.

## Licencia
Distribuido bajo licencia MIT. Ver el archivo `LICENSE`.