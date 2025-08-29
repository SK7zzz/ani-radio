import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Github, Heart, Users, Zap, Database, Globe, Star, GitBranch } from 'lucide-react'
import { PWASection } from '@/components/pwa-section'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <img
              src="/aniradio-logo.webp"
              alt="AniRadio Logo"
              className="h-20 w-20 md:h-36 md:w-36"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Anime Music
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Playlists aleatorias infinitas basadas en tu lista de anime de AniList
          </p>
        </div>

        {/* Project Description */}
        <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              ¿Qué es AniRadio?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">
              AniRadio es una aplicación web progresiva (PWA) que crea playlists completamente aleatorias
              basadas en tu lista de anime de AniList. Combina la potencia de la API de{' '}
              <a
                href="https://docs.anilist.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
              >
                AniList <ExternalLink className="h-4 w-4" />
              </a>
              {' '}con la extensa base de datos de{' '}
              <a
                href="https://github.com/xSardine/AMQ-Artists-DB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
              >
                AniSongDB <ExternalLink className="h-4 w-4" />
              </a>
              {' '}para ofrecerte una experiencia musical única.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">PWA Ready</h3>
                  <p className="text-sm text-muted-foreground">Instálala como app nativa</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Sin Registro</h3>
                  <p className="text-sm text-muted-foreground">Todo se guarda localmente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Open Source</h3>
                  <p className="text-sm text-muted-foreground">Código abierto para todos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Section */}
        <PWASection />

        {/* Team Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Equipo de Desarrollo
            </CardTitle>
            <CardDescription>
              Creado por amantes de la música japonesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/20 border border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">@sk7zzz</h3>
                  <p className="text-muted-foreground">Desarrollador Principal</p>
                  <a
                    href="https://x.com/SK7zzz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
                  >
                    Twitter <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-secondary/20 to-primary/10 border border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">M</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">@moisapto</h3>
                  <p className="text-muted-foreground">Colaborador</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Características Principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Playlists completamente aleatorias",
                "Basado en tu lista de AniList",
                "Datos guardados localmente (IndexedDB)",
                "PWA - Instálala como app",
                "Sin necesidad de registro",
                "Código abierto y libre"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="border-primary/20 bg-gradient-to-r from-card to-accent/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Roadmap Futuro
            </CardTitle>
            <CardDescription>
              Funcionalidades que estamos planeando implementar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>

              <div className="space-y-6">
                {[
                  {
                    title: "Nombres en JP/EN",
                    description: "Switch para alternar entre nombres de animes en japonés e inglés"
                  },
                  {
                    title: "Integración con MyAnimeList",
                    description: "Soporte para listas de MAL además de AniList"
                  },
                  {
                    title: "Filtros Avanzados",
                    description: "Filtrar playlists por género, año, estudio, etc."
                  },
                  {
                    title: "Playlists por Artista",
                    description: "Crear playlists aleatorias de artistas específicos"
                  },
                  {
                    title: "Sistema de Favoritos",
                    description: "Marcar canciones favoritas y crear playlists especiales"
                  },
                  {
                    title: "Persistencia de Playlist",
                    description: "Las playlists se guardan automáticamente en el navegador"
                  },
                  {
                    title: "Sincronización Multi-dispositivo",
                    description: "Sincronizar datos entre diferentes dispositivos"
                  }
                ].map((item, index) => (
                  <div key={index} className="relative flex items-center gap-4">
                    {/* Punto en la línea - centrado con la card */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-sm"></div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="bg-card border border-primary/20 rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribute Section */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Github className="h-6 w-6 text-primary" />
              Contribuye al Proyecto
            </CardTitle>
            <CardDescription>
              ¡Tu feedback y contribuciones son bienvenidas!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Como proyecto de código abierto, valoramos enormemente las contribuciones de la comunidad.
              Si tienes ideas, encuentras bugs, o quieres contribuir con código, hay varias formas de participar:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border border-primary/20">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Github className="h-5 w-5 text-primary" />
                  GitHub Issues
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Reporta bugs o sugiere nuevas funcionalidades abriendo un issue en nuestro repositorio.
                </p>
                <Badge variant="outline">Issues Bienvenidos</Badge>
              </div>

              <div className="p-4 rounded-lg bg-card border border-primary/20">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Contacto Directo
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Comparte tus ideas hablando directamente con el equipo en Twitter.
                </p>
                <a
                  href="https://x.com/SK7zzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <Badge variant="default">@SK7zzz en Twitter</Badge>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
              <p className="text-sm">
                <strong>Fork el proyecto:</strong> Siéntete libre de hacer fork del repositorio y crear tu propia versión
                de AniRadio. ¡Nos encanta ver qué ideas creativas puede tener la comunidad!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground">
            Hecho con <Heart className="inline h-4 w-4 text-red-500" />
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Proyecto de código abierto • Sin fines de lucro • Para la comunidad
          </p>
        </div>
      </div>
    </div>
  )
}
