import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wifi, X } from 'lucide-react';
import { usePWAUpdate } from '@/hooks/use-pwa-update';

export function PWAUpdatePrompt() {
    const { needRefresh, offlineReady, updateApp, dismissUpdate, dismissOfflineReady } = usePWAUpdate();

    if (!needRefresh && !offlineReady) {
        return null;
    }

    if (offlineReady) {
        return (
            <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-green-500/20 bg-gradient-to-r from-card to-green-500/5 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wifi className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-lg">App Lista</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={dismissOfflineReady}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        AniRadio está instalada y lista para usar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={dismissOfflineReady} className="w-full">
                        Entendido
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (needRefresh) {
        return (
            <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 border-blue-500/20 bg-gradient-to-r from-card to-blue-500/5 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg">Actualización Disponible</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={dismissUpdate}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardDescription>
                        Nueva versión de AniRadio disponible
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Se han detectado mejoras y correcciones. Actualiza para obtener la mejor experiencia.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={updateApp} className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                        </Button>
                        <Button variant="outline" onClick={dismissUpdate}>
                            Más tarde
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}
