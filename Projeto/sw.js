const CACHE_NAME = 'bozo-marcador-v1';
const ASSETS = [
  '',
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'icon.svg'
];

// Instalação do Service Worker e Armazenamento em Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Arquivos cacheados com sucesso!');
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Estratégia de Servir o Conteúdo do Cache Primeiro (Funciona Offline)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});