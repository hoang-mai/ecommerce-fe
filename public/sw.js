self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  if (event.data) {
    const data = event.data.json();
    console.log('[Service Worker] Push data:', data);

    const title = data.title;
    const options = {
      body: data.message || 'Bạn có thông báo mới',
      icon: '/logo.svg',
      badge: '/logo.svg',
      vibrate: [200, 100, 200],
      tag: data.notificationId || data.timestamp,
      data: {
        url: data.data.url || '/',
        notificationId: data.data.notificationId,
        notificationType: data.data.notificationType
      },
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Xem',
        },
        {
          action: 'close',
          title: 'Đóng',
        }
      ]
    };
    console.log('[Service Worker] Showing notification:', title, options);
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window/tab open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});

