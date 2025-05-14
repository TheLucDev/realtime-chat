importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyBohb0Beq9bZTdULP2SW_L-Q_Xg0K5lPf8',
  authDomain: 'gfchat-76776.firebaseapp.com',
  projectId: 'gfchat-76776',
  messagingSenderId: '314071096707',
  appId: '1:314071096707:web:cb849b36ac0572ec106ab6',
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
