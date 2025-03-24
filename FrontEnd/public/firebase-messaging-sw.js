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
];

// Initialize Firebase
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

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/icons/icon-192x192.png',
        badge: payload.notification.badge || '/icons/icon-192x192.png',
        image: payload.notification.image,
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Install event handler
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

// Fetch event handler with cache-first strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and Firebase-related requests
    if (
        event.request.method !== 'GET' ||
        event.request.url.includes('firebase') ||
        event.request.url.startsWith('chrome-extension://')
    ) {
        return;
    }

    event.respondWith(
        // Try cache first
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('📦 Serving from cache:', event.request.url);
                    // Fetch and cache update in background
                    fetch(event.request)
                        .then((networkResponse) => {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, networkResponse);
                                    console.log('🔄 Updated cache:', event.request.url);
                                });
                        })
                        .catch(() => {
                            console.log('❌ Network update failed:', event.request.url);
                        });
                    return cachedResponse;
                }

                // If not in cache, try network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Clone the response before using it
                        const responseToCache = networkResponse.clone();

                        if (networkResponse.status === 200) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                    console.log('📥 Added to cache:', event.request.url);
                                });
                        }

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.log('❌ Network & cache failed:', event.request.url, error);
                        // If both cache and network fail, return offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        return new Response('Offline content not available');
                    });
            })
    );
});

// Injection point for the precache manifest
self.__WB_MANIFEST;