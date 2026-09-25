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

const APP_SCOPE_URL = new URL(self.registration.scope);
const APP_SCOPE_PATH_PREFIX = APP_SCOPE_URL.pathname.endsWith("/")
    ? APP_SCOPE_URL.pathname
    : `${APP_SCOPE_URL.pathname}/`;
const NOTIFICATION_FALLBACK_URL = new URL("index.html", self.registration.scope).href;

function isAllowedNotificationUrl(url) {
    const normalizedPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
    return url.origin === APP_SCOPE_URL.origin && normalizedPath.startsWith(APP_SCOPE_PATH_PREFIX);
}

function resolveNotificationUrl(payload = {}) {
    const notification = payload.notification || {};
    const candidateUrl = notification.click_action || payload.fcmOptions?.link || payload.data?.url;

    if (!candidateUrl) {
        return NOTIFICATION_FALLBACK_URL;
    }

    try {
        const resolvedUrl = new URL(candidateUrl, self.registration.scope);
        return isAllowedNotificationUrl(resolvedUrl) ? resolvedUrl.href : NOTIFICATION_FALLBACK_URL;
    } catch (error) {
        return NOTIFICATION_FALLBACK_URL;
    }
}

messaging.onBackgroundMessage(payload => {
    const notification = payload.notification || {};
    const title = notification.title || "Kuantan Flood Alert";

    self.registration.showNotification(title, {
        body: notification.body || "New flood information is available.",
        icon: notification.icon || "/favicon.svg",
        data: {
            url: resolveNotificationUrl(payload)
        }
    });
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil((async () => {
        const targetUrl = resolveNotificationUrl({ data: { url: event.notification.data?.url } });
        const resolvedTarget = new URL(targetUrl);
        const windowClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
        const existingClient = windowClients.find(client => {
            try {
                const clientUrl = new URL(client.url);
                return clientUrl.origin === resolvedTarget.origin &&
                    clientUrl.pathname === resolvedTarget.pathname &&
                    clientUrl.search === resolvedTarget.search &&
                    clientUrl.hash === resolvedTarget.hash;
            } catch (error) {
                return false;
            }
        });

        if (existingClient) {
            if ("navigate" in existingClient) {
                await existingClient.navigate(targetUrl);
            }
            return existingClient.focus();
        }

        return clients.openWindow(targetUrl);
    })());
});
