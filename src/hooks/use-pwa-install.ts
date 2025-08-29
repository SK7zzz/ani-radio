import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si ya está instalada
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }

        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            // Prevenir que el navegador muestre el prompt automáticamente
            e.preventDefault();
            // Guardar el evento para usarlo después
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            console.log('PWA fue instalada');
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return false;

        try {
            // Mostrar el prompt de instalación
            await deferredPrompt.prompt();

            // Esperar la respuesta del usuario
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('Usuario aceptó instalar la PWA');
                setIsInstallable(false);
                setDeferredPrompt(null);
                return true;
            } else {
                console.log('Usuario rechazó instalar la PWA');
                return false;
            }
        } catch (error) {
            console.error('Error al intentar instalar la PWA:', error);
            return false;
        }
    };

    return {
        isInstallable,
        isInstalled,
        installPWA
    };
};
