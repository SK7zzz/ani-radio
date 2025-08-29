# 🎵 AniRadio

<div align="center">
  <img src="src/assets/aniradio-logo.webp" alt="AniRadio Logo" width="120" height="120">
  
  **Playlists aleatorias infinitas basadas en tu lista de anime de AniList**
  
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-brightgreen)](https://web.dev/progressive-web-apps/)
  [![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red)](https://github.com/SK7zzz/ani-radio)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
</div>

## ✨ ¿Qué es AniRadio?

AniRadio es una **aplicación web progresiva (PWA)** que crea playlists completamente aleatorias basadas en tu lista de anime de AniList. Combina la potencia de la [API de AniList](https://docs.anilist.co/) con la extensa base de datos de [AniSongDB](https://github.com/xSardine/AMQ-Artists-DB) para ofrecerte una experiencia musical única.

### 🚀 Características Principales

- 🎲 **Playlists completamente aleatorias** - Descubre música nueva de tus animes favoritos
- 📱 **PWA Ready** - Instálala como app nativa en tu dispositivo
- 🔒 **Sin registro necesario** - Todo se guarda localmente en tu navegador
- 💾 **Almacenamiento local** - Datos guardados con IndexedDB
- 🎯 **Basado en AniList** - Usa tu lista personal de anime
- 🆓 **Completamente gratuito** - Sin anuncios, sin suscripciones
- 🌙 **Tema oscuro/claro** - Interfaz adaptable
- 📂 **Código abierto** - Disponible para toda la comunidad

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router (File-based routing)
- **Estado**: TanStack Query + Zustand
- **Estilos**: Tailwind CSS + shadcn/ui
- **Build**: Vite
- **PWA**: Service Worker + Web App Manifest
- **Base de datos local**: IndexedDB
- **APIs**: AniList GraphQL API + AniSongDB

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/SK7zzz/ani-radio.git
cd ani-radio

# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

### Comandos Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Previsualizar build
pnpm preview

# Linting
pnpm lint

# Tests (si están configurados)
pnpm test
```

## 📱 Instalación como PWA

1. **En navegadores móviles**: Busca el banner de "Añadir a pantalla de inicio"
2. **En escritorio**: Busca el icono de instalación en la barra de direcciones
3. **Chrome**: Menú → "Instalar AniRadio..."

## 🎯 Cómo Usar

1. **Conecta tu AniList**: Introduce tu username de AniList
2. **Carga tu lista**: La app obtendrá automáticamente tu lista de anime
3. **¡Reproduce!**: Disfruta de playlists aleatorias basadas en tus animes
4. **Navega**: Usa los controles del reproductor para cambiar canciones

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── anime-list.tsx  # Lista de animes del usuario
│   ├── music-player.tsx # Reproductor principal
│   └── ...
├── contexts/           # Context providers (tema, etc.)
├── hooks/              # Custom hooks
│   ├── use-anilist.ts  # Hook para AniList API
│   ├── use-music-player.ts # Logic del reproductor
│   └── ...
├── lib/                # Utilidades y configuración
│   ├── stores/         # Stores de estado (Zustand)
│   ├── utils/          # Funciones de utilidad
│   └── query-client.ts # Configuración TanStack Query
├── routes/             # Rutas de la aplicación
│   ├── __root.tsx      # Layout principal
│   ├── index.tsx       # Página principal
│   ├── about.tsx       # Página sobre
│   └── playlist.tsx    # Página de playlist
├── services/           # Servicios para APIs externas
│   ├── anilist-service.ts    # API de AniList
│   ├── anisong-service.ts    # API de AniSongDB
│   └── ...
└── types/              # Definiciones de TypeScript
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Crea un archivo `.env.local` (opcional):

```env
# Variables de desarrollo (si las necesitas)
VITE_API_BASE_URL=http://localhost:3000
```

### Configuración del Editor

Se recomienda usar VS Code con las siguientes extensiones:

- TypeScript y JavaScript
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter

## 🗺️ Roadmap

### 🎯 Próximas Funcionalidades

- [ ] **Nombres JP/EN**: Switch para alternar idiomas de nombres de anime
- [ ] **Integración MAL**: Soporte para MyAnimeList
- [ ] **Filtros Avanzados**: Por género, año, estudio, etc.
- [ ] **Playlists por Artista**: Playlists específicas de artistas
- [ ] **Sistema de Favoritos**: Marcar canciones favoritas
- [ ] **Persistencia de Playlist**: Guardar playlists automáticamente
- [ ] **Sincronización Multi-dispositivo**: Sync entre dispositivos

### 🛠️ Mejoras Técnicas

- [ ] Tests unitarios y de integración
- [ ] Optimización de bundle
- [ ] Mejor manejo de errores
- [ ] Métricas de rendimiento
- [ ] Soporte offline mejorado

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto de código abierto y valoramos el feedback de la comunidad.

### Formas de Contribuir

1. **🐛 Reportar Bugs**: Abre un [issue](https://github.com/SK7zzz/ani-radio/issues)
2. **💡 Sugerir Features**: Comparte tus ideas en issues
3. **🔧 Pull Requests**: Contribuye con código
4. **📖 Documentación**: Mejora la documentación
5. **🌟 Feedback**: Comparte tu experiencia

### Desarrollo Local

```bash
# Fork el repositorio y clónalo
git clone https://github.com/tu-usuario/ani-radio.git

# Crea una rama para tu feature
git checkout -b feature/nueva-funcionalidad

# Realiza tus cambios y commitea
git commit -m "feat: añadir nueva funcionalidad"

# Push y crea un PR
git push origin feature/nueva-funcionalidad
```

## 👥 Equipo

- **[@SK7zzz](https://x.com/SK7zzz)** - Desarrollador Principal
- **[@moisapto](https://github.com/moisapto)** - Colaborador

## 📞 Contacto

- **Twitter**: [@SK7zzz](https://x.com/SK7zzz)
- **GitHub Issues**: [Reportar problemas](https://github.com/SK7zzz/ani-radio/issues)

## 📜 Licencias y Atribuciones

- **AniList**: Datos de anime via [AniList API](https://docs.anilist.co/)
- **AniSongDB**: Base de datos de canciones via [AMQ-Artists-DB](https://github.com/xSardine/AMQ-Artists-DB)
- **shadcn/ui**: Componentes de interfaz
- **Lucide**: Iconos

## ❤️ Agradecimientos

Agradecemos a toda la comunidad de anime y a los desarrolladores de las APIs que hacen posible este proyecto. 

**Hecho con ❤️ para la comunidad del anime**

---

*Proyecto sin fines de lucro • Código abierto • Para la comunidad*
