# FixMind

Plataforma integral para la gestión y consulta de diagnósticos técnicos, catálogo inteligente de fallas y administración de usuarios para centros de soporte electrónico.

**Integrantes del equipo:**
- Pedro Ángel Zarzosa Piza

---

## Requisitos

- [Docker Desktop](https://www.docker.com/) (motor Docker y plugin Docker Compose instalados y en ejecución)
- [Git](https://git-scm.com/)

---

## Instalación y ejecución

```bash
git clone <URL-del-repositorio>
cd <carpeta-del-proyecto>
cp .env.example .env
# Editar .env con sus propios valores si es necesario
docker compose up --build