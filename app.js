// --- Khởi tạo Firebase ---
const firebaseConfig = {
  apiKey: 'AIzaSyBohb0Beq9bZTdULP2SW_L-Q_Xg0K5lPf8',
  authDomain: 'gfchat-76776.firebaseapp.com',
  databaseURL:
    'https://gfchat-76776-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'gfchat-76776',
  storageBucket: 'gfchat-76776.firebasestorage.app',
  messagingSenderId: '314071096707',
  appId: '1:314071096707:web:cb849b36ac0572ec106ab6',
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Biến toàn cục ---
let fcmToken = '';
let messaging; // chỉ khởi tạo 1 lần

// --- Đăng ký Service Worker và FCM ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('firebase-messaging-sw.js')
    .then(function (registration) {
      if (!messaging) {
        messaging = firebase.messaging();
        messaging.useServiceWorker(registration);
      }

      // Đăng ký nhận push notification khi đăng nhập thành công
      window.registerPush = function (currentUser) {
        messaging
          .requestPermission()
          .then(function () {
            return messaging.getToken({
              vapidKey:
                'BDJeCsLab57OJx3bu6PemS1aKFEmAjLxFua1WK5tYQt7tl-L9hl0bk0ctDkxEmWgrpKtWwXD7Gg7_seEktZE9I4',
            });
          })
          .then(function (token) {
            fcmToken = token;
            if (currentUser) {
              db.ref('pushTokens/' + currentUser).set(token);
            }
          })
          .catch(function (err) {
            console.log('Không thể lấy FCM token:', err);
          });
      };

      // Nhận thông báo khi app đang mở
      messaging.onMessage(function (payload) {
        if (Notification.permission === 'granted') {
          const { title, body, icon } = payload.notification;
          new Notification(title, { body, icon });
        }
      });
    });
}

// --- Lưu user để tự động đăng nhập ---
const savedUser = localStorage.getItem('currentUser');
const savedOther = localStorage.getItem('otherUser');

const loginScreen = document.getElementById('login-screen');
const body = document.querySelector('body');
const chatContainer = document.querySelector('.chat-container');
const loginButton = document.getElementById('login-button');
const passwordInput = document.getElementById('password-input');
body.classList.add('body-lock-scroll');

// Người dùng hiện tại
let currentUser = '';
let otherUser = '';

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const typingStatus = document.getElementById('typing-status');
let typingStatusTimeout;
chatContainer.style.display = 'none';

// --- Tự động đăng nhập nếu đã lưu user ---
if (savedUser && savedOther) {
  currentUser = savedUser;
  otherUser = savedOther;
  loginScreen.style.display = 'none';
  chatContainer.style.display = 'flex';
  body.classList.add('login-success');
  body.classList.remove('body-lock-scroll');
  startChatListener();
  if (window.Notification && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
  if (window.registerPush) window.registerPush(currentUser);
}

// --- Đăng nhập ---
loginButton.addEventListener('click', function () {
  const enteredPIN = passwordInput.value;
  if (enteredPIN === '230603') {
    currentUser = 'minhuyn';
    otherUser = 'minmin';
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    body.classList.add('login-success');
    body.classList.remove('body-lock-scroll');
    startChatListener();
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    if (window.registerPush) window.registerPush(currentUser);
  } else if (enteredPIN === '171296') {
    currentUser = 'minmin';
    otherUser = 'minhuyn';
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    body.classList.add('login-success');
    body.classList.remove('body-lock-scroll');
    startChatListener();
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    if (window.registerPush) window.registerPush(currentUser);
  } else {
    passwordInput.classList.add('shake');
    setTimeout(() => {
      passwordInput.classList.remove('shake');
    }, 500);
    alert('Sinh nhật của em đoá!');
  }
  localStorage.setItem('currentUser', currentUser);
  localStorage.setItem('otherUser', otherUser);
});

// --- Fix chiều cao chat-container trên mobile ---
function setChatContainerHeight() {
  const chatContainer = document.querySelector('.chat-container');
  if (window.innerWidth <= 600 && chatContainer) {
    chatContainer.style.height = window.innerHeight + 'px';
  } else if (chatContainer) {
    chatContainer.style.height = '';
  }
}
window.addEventListener('resize', setChatContainerHeight);
window.addEventListener('orientationchange', setChatContainerHeight);
window.addEventListener('DOMContentLoaded', setChatContainerHeight);
setChatContainerHeight();

// --- Lắng nghe và render tin nhắn ---
function startChatListener() {
  chatBox.innerHTML = '';
  db.ref('messages').off();
  db.ref('messages').on('child_added', function (snapshot) {
    const msg = snapshot.val();
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(msg.sender === currentUser ? 'sent' : 'received');
    messageDiv.dataset.key = snapshot.key;

    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = msg.sender === 'minhuyn' ? 'minhuyn.jpg' : 'minmin.png';

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = msg.text;

    // Nút xoá từng tin nhắn (chỉ cho phép xoá tin nhắn của mình)
    if (msg.sender === currentUser) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.title = 'Xoá tin nhắn';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.onclick = function () {
        const key = messageDiv.dataset.key;
        db.ref('messages/' + key).remove();
      };
      messageDiv.appendChild(deleteBtn);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // --- Thông báo khi có tin nhắn mới từ người kia và tab không active ---
    if (
      msg.sender === otherUser &&
      document.visibilityState !== 'visible' &&
      Notification.permission === 'granted'
    ) {
      new Notification(`${otherUser} gửi tin nhắn mới`, {
        body: msg.text,
        icon: msg.sender === 'minhuyn' ? 'minhuyn.jpg' : 'minmin.png',
      });
    }
  });

  // Lắng nghe xoá tin nhắn realtime
  db.ref('messages').on('child_removed', function (snapshot) {
    const key = snapshot.key;
    const msgDiv = chatBox.querySelector(`.message[data-key="${key}"]`);
    if (msgDiv) chatBox.removeChild(msgDiv);
  });

  // Lắng nghe trạng thái typing của cả hai user
  db.ref('typing/' + currentUser).off();
  db.ref('typing/' + otherUser).off();

  // Chỉ hiện "Bạn đang nhập..." nếu currentUser đang nhập
  db.ref('typing/' + currentUser).on('value', function (snapshot) {
    const isTyping = snapshot.val();
    if (isTyping) {
      typingStatus.textContent = 'Bạn đang nhập...';
      clearTimeout(typingStatusTimeout);
      typingStatusTimeout = setTimeout(() => {
        typingStatus.textContent = '';
      }, 3000);
    } else {
      // Nếu currentUser không nhập, kiểm tra otherUser
      db.ref('typing/' + otherUser)
        .once('value')
        .then((snap) => {
          if (snap.val()) {
            typingStatus.textContent = `${otherUser} đang nhập...`;
            clearTimeout(typingStatusTimeout);
            typingStatusTimeout = setTimeout(() => {
              typingStatus.textContent = '';
            }, 3000);
          } else {
            typingStatus.textContent = '';
            clearTimeout(typingStatusTimeout);
          }
        });
    }
  });
}

// --- Gửi tin nhắn bằng Enter ---
messageInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter' && messageInput.value.trim() !== '') {
    const message = {
      text: messageInput.value,
      sender: currentUser,
      timestamp: Date.now(),
    };
    db.ref('messages').push(message);
    messageInput.value = '';
    db.ref('typing/' + currentUser).set(false);
  } else {
    db.ref('typing/' + currentUser).set(true);
  }
});

// --- Gửi tin nhắn bằng nút gửi ---
const sendButton = document.getElementById('send-button');
sendButton.addEventListener('click', function () {
  if (messageInput.value.trim() !== '') {
    const message = {
      text: messageInput.value,
      sender: currentUser,
      timestamp: Date.now(),
    };
    db.ref('messages').push(message);
    messageInput.value = '';
    db.ref('typing/' + currentUser).set(false);
  }
});

// --- Ngưng typing sau 2 giây không gõ ---
let typingTimeout;
messageInput.addEventListener('input', function () {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.ref('typing/' + currentUser).set(false);
  }, 2000);
});

// --- Xoá tất cả tin nhắn ---
const deleteAllBtn = document.getElementById('delete-all-btn');
if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', function () {
    if (confirm('Bạn có chắc muốn xoá tất cả tin nhắn không?')) {
      db.ref('messages').remove();
    }
  });
}
