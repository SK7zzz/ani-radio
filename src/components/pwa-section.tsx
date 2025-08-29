import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function PWASection() {
    const { isInstallable, isInstalled, installPWA } = usePWAInstall();

    const handleInstall = async () => {
        await installPWA();
    };

    return (
        <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-primary" />
                    Instalar como Aplicación
                </CardTitle>
                <CardDescription>
                    Instala AniRadio en tu dispositivo para acceder más fácilmente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Estado de Instalación */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-secondary">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        {isInstalled ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Aplicación Instalada
                            </>
                        ) : isInstallable ? (
                            <>
                                <Download className="h-5 w-5 text-primary" />
                                Listo para Instalar
                            </>
                        ) : (
                            <>
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                                Estado de Instalación
                            </>
                        )}
                    </h4>

                    {isInstalled && (
                        <div className="space-y-2">
                            <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-400">
                                ✓ Instalada correctamente
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                AniRadio está instalada como aplicación en tu dispositivo.
                            </p>
                        </div>
                    )}

                    {isInstallable && !isInstalled && (
                        <div className="space-y-3">
                            <Badge variant="outline" className="border-primary text-primary">
                                Disponible para instalar
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                Instala AniRadio para acceder más fácilmente desde tu pantalla de inicio.
                            </p>
                            <Button onClick={handleInstall} size="sm" className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Instalar Aplicación
                            </Button>
                        </div>
                    )}

                    {!isInstallable && !isInstalled && (
                        <div className="space-y-2">
                            <Badge variant="secondary">
                                No disponible para instalar
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                Tu navegador no soporta instalación de PWAs o ya está instalada desde otro navegador.
                            </p>
                        </div>
                    )}
                </div>

                {/* Beneficios de la PWA */}
                <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3">Beneficios de instalar la aplicación:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                        {[
                            "Acceso directo desde tu pantalla de inicio",
                            "Interfaz limpia sin barra del navegador",
                            "Iconos y splash screen personalizados",
                            "Mejor integración con el sistema operativo"
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
