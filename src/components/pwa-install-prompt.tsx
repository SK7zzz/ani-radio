import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useState } from 'react';

export function PWAInstallPrompt() {
    const { isInstallable, isInstalled, installPWA } = usePWAInstall();
    const [isHidden, setIsHidden] = useState(false);

    if (!isInstallable || isInstalled || isHidden) {
        return null;
    }

    const handleInstall = async () => {
        const success = await installPWA();
        if (success || !success) {
            setIsHidden(true);
        }
    };

    const handleDismiss = () => {
        setIsHidden(true);
    };

    return (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-primary/20 bg-gradient-to-r from-card to-primary/5 shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Instalar AniRadio</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription>
                    Instala AniRadio en tu dispositivo para una experiencia nativa
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    • Acceso directo desde tu pantalla de inicio
                    • Funciona sin conexión
                    • Experiencia de app nativa
                </p>
                <div className="flex gap-2">
                    <Button onClick={handleInstall} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Instalar
                    </Button>
                    <Button variant="outline" onClick={handleDismiss}>
                        Más tarde
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
