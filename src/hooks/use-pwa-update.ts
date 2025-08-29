// Hook simple - no service worker bullshit
export const usePWAUpdate = () => {
    return {
        needRefresh: false,
        offlineReady: false,
        updateApp: async () => {
            // console.log('No hay actualizaciones automáticas - solo refresca la página');
            window.location.reload();
        },
        dismissUpdate: () => { },
        dismissOfflineReady: () => { }
    };
};