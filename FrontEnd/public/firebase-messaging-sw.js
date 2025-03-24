// Import Firebase scripts first
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Service Worker version
const CACHE_VERSION = 'v1';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Add all the files you want to cache
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Add your CSS and JS files that Vite generates
    // You can find these in the dist folder after building
];

// Initialize Firebase first
firebase.initializeApp({
    apiKey: "AIzaSyBitV6MCQj4INcj_yfW4ljILifa-7ziRik",
    authDomain: "pwa-push-notification-8649b.firebaseapp.com",
    projectId: "pwa-push-notification-8649b",
    storageBucket: "pwa-push-notification-8649b.firebasestorage.app",
    messagingSenderId: "504230264197",
    appId: "1:504230264197:web:6723b541451cb8fd2498ec",
    measurementId: "G-HL2TYM3QF6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    // const notificationOptions = {
    //     body: payload.notification.body,
    //     icon: payload.notification.icon || '/icons/icon-192x192.png',
    //     badge: payload.notification.badge || '/icons/icon-192x192.png',
    //     image: payload.notification.image,
    //     data: payload.data
    // };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Install event handler with precaching
self.addEventListener('install', (event) => {
    console.log('🔧 Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Opened cache');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Installation completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Installation failed:', error);
            })
    );
});

// Activate event handler
self.addEventListener('activate', (event) => {
    console.log('🚀 Activating Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🧹 Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event handler with network-first strategy
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Don't cache Firebase API calls or chrome-extension requests
    if (
        event.request.url.includes('firebase') ||
        event.request.url.startsWith('chrome-extension://')
    ) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Clone the response before caching it
                const responseToCache = networkResponse.clone();

                if (networkResponse.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            console.log('📥 Caching new resource:', event.request.url);
                            cache.put(event.request, responseToCache);
                        });
                }

                return networkResponse;
            })
            .catch(() => {
                console.log('🔍 Serving from cache:', event.request.url);
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache found, return a default offline page or asset
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Optional: Handle offline fallback
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('/offline.html');
                })
        );
    }
});

// Injection point for the precache manifest
self.__WB_MANIFEST;