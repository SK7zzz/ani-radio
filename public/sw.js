// Service Worker básico - NO CACHEA NADA
// Solo existe para que funcione como PWA instalable

self.addEventListener('install', (event) => {
    console.log('SW instalado - sin cachés');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activado');
    event.waitUntil(
        // Limpiar cualquier caché viejo
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('Borrando caché viejo:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // NO hacer nada - dejar que el navegador maneje todo
    // TanStack Query se encarga de los cachés
});

console.log('SW básico cargado - sin cachés, solo PWA');
