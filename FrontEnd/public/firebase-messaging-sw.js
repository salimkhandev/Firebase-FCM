
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


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
    console.log('Received background message:', payload);

    // // Only show a notification if there's no notification field (i.e., FCM won't handle it)
    // if (!payload.notification && payload.data) {
    //     const notificationTitle = payload.data.title || 'Default Title';
    //     const notificationOptions = {
    //         body: payload.data.body || 'Default Body',
    //         icon: '/icon.png',
    //     };
    //     return self.registration.showNotification(notificationTitle, notificationOptions);
    // }
});