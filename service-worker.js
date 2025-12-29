// Service Worker pour le mode hors ligne
const CACHE_NAME = 'ag-copropriete-v1';

// Fonction pour obtenir les URLs à mettre en cache
function getUrlsToCache() {
    const baseUrl = self.location.origin + self.location.pathname.replace(/\/[^/]*$/, '/');
    return [
        baseUrl,
        baseUrl + 'index.html',
        baseUrl + 'styles.css',
        baseUrl + 'app.js',
        baseUrl + 'db.js',
        baseUrl + 'manifest.json',
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ];
}

// Installation
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(getUrlsToCache());
            })
            .catch((error) => {
                console.log('Erreur lors du cache:', error);
            })
    );
    self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Stratégie: Cache First, puis réseau
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourner la réponse du cache si disponible
                if (response) {
                    return response;
                }
                // Sinon, faire une requête réseau
                return fetch(event.request).then((response) => {
                    // Vérifier si la réponse est valide
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Cloner la réponse pour le cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                }).catch(() => {
                    // En cas d'erreur réseau, retourner une page hors ligne si c'est une navigation
                    if (event.request.mode === 'navigate') {
                        const baseUrl = self.location.origin + self.location.pathname.replace(/\/[^/]*$/, '/');
                        return caches.match(baseUrl + 'index.html');
                    }
                });
            })
    );
});

