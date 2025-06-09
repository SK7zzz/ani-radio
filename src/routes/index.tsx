import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleGreet = () => {
    if (name) {
      setMessage(`¡Hola, ${name}! 🎉 shadcn/ui está funcionando perfectamente.`)
    } else {
      setMessage('¡Ingresa tu nombre para saludarte! 😊')
    }
  }

  const handleReset = () => {
    setName('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            className="h-16 w-16 mx-auto mb-4 animate-[spin_20s_linear_infinite]"
            alt="React logo"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ¡shadcn/ui está listo! 🚀
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            React + TanStack Router + shadcn/ui + TailwindCSS
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Interactive Demo Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Demo Interactivo
              </CardTitle>
              <CardDescription>
                Prueba los componentes de shadcn/ui en acción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre</Label>
                <Input
                  id="name"
                  placeholder="Escribe tu nombre aquí..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGreet} className="flex-1">
                  Saludar 👋
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Limpiar
                </Button>
              </div>
              {message && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    {message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Component Showcase Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Variantes de Botones
              </CardTitle>
              <CardDescription>
                Diferentes estilos disponibles en shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
              <div className="flex gap-2 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 Información del Setup
            </CardTitle>
            <CardDescription>
              Tu proyecto está configurado con las mejores herramientas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  ✅ Tecnologías instaladas:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• React 19 con TypeScript</li>
                  <li>• TanStack Router para routing</li>
                  <li>• TailwindCSS v4 para estilos</li>
                  <li>• shadcn/ui para componentes</li>
                  <li>• Vite para desarrollo</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  🚀 Próximos pasos:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Instala más componentes con <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">npx shadcn@latest add [component]</code></li>
                  <li>• Personaliza el tema en <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">src/styles.css</code></li>
                  <li>• Explora la documentación oficial</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex justify-center gap-4">
            <a
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              href="https://ui.shadcn.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              📖 shadcn/ui Docs
            </a>
            <a
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              href="https://tanstack.com/router"
              target="_blank"
              rel="noopener noreferrer"
            >
              🛣️ TanStack Router
            </a>
            <a
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              🎨 TailwindCSS
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            nyan~ ¡Tu proyecto está listo para crear cosas increíbles! 🐱
          </p>
        </div>
      </div>
    </div>
  )
}
