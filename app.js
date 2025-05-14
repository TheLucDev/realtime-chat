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

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

// Đăng nhập
loginButton.addEventListener('click', function () {
  const enteredPIN = passwordInput.value;
  if (enteredPIN === '230603') {
    currentUser = 'minhuyn';
    otherUser = 'minmin';
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    body.classList.add('login-success');
    body.classList.remove('body-lock-scroll'); // Mở scroll khi đã login
    startChatListener();
  } else if (enteredPIN === '171296') {
    currentUser = 'minmin';
    otherUser = 'minhuyn';
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    body.classList.add('login-success');
    startChatListener();
  } else {
    passwordInput.classList.add('shake');
    setTimeout(() => {
      passwordInput.classList.remove('shake');
    }, 500);
    alert('Sinh nhật của em đoá!');
  }
});

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

// Gửi tin nhắn bằng Enter
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

// Gửi tin nhắn bằng nút gửi
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

// Ngưng typing sau 2 giây không gõ
let typingTimeout;
messageInput.addEventListener('input', function () {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.ref('typing/' + currentUser).set(false);
  }, 2000);
});

// Xoá tất cả tin nhắn
const deleteAllBtn = document.getElementById('delete-all-btn');
if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', function () {
    if (confirm('Bạn có chắc muốn xoá tất cả tin nhắn không?')) {
      db.ref('messages').remove();
    }
  });
}
