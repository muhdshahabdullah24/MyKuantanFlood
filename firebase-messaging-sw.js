importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyDN9ZfO6yF_5ieIzV_Hv1_udoUERMjsm0s",
    authDomain: "mykuantanflood-f767e.firebaseapp.com",
    projectId: "mykuantanflood-f767e",
    storageBucket: "mykuantanflood-f767e.firebasestorage.app",
    messagingSenderId: "66275186842",
    appId: "1:66275186842:web:d3b34d906c0c1fb65f6723",
    measurementId: "G-QW11X13ZC4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    const notification = payload.notification || {};
    const title = notification.title || "Kuantan Flood Alert";

    self.registration.showNotification(title, {
        body: notification.body || "New flood information is available.",
        icon: notification.icon || "/favicon.svg",
        data: {
            url: notification.click_action || "/"
        }
    });
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
