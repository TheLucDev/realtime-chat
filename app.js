const correctPIN = '230603'; // <== Đây là mã PIN bạn yêu cầu
const loginScreen = document.getElementById('login-screen');
const body = document.querySelector('body');
const chatContainer = document.querySelector('.chat-container');
const loginButton = document.getElementById('login-button');
const passwordInput = document.getElementById('password-input');

loginButton.addEventListener('click', function () {
  const enteredPIN = passwordInput.value;
  if (enteredPIN === correctPIN) {
    loginScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    body.classList.add('login-success'); // Thêm class này vào body để căn giữa khung chat
  } else {
    passwordInput.classList.add('shake');
    setTimeout(() => {
      passwordInput.classList.remove('shake');
    }, 500);
    alert('Sai mã PIN rồi 😢. Thử lại nhé!');
  }
});

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

// Người dùng hiện tại
const currentUser = 'minmin';
const otherUser = 'minhuyen';

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const typingStatus = document.getElementById('typing-status');

// Gửi tin nhắn
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

// Ngưng typing sau 2 giây không gõ
let typingTimeout;
messageInput.addEventListener('input', function () {
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.ref('typing/' + currentUser).set(false);
  }, 2000);
});

// Load tin nhắn
db.ref('messages').on('child_added', function (snapshot) {
  const msg = snapshot.val();
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(msg.sender === currentUser ? 'sent' : 'received');

  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = msg.sender === currentUser ? 'minmin.png' : 'minhuyen.jpg';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = msg.text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Typing effect
db.ref('typing/' + otherUser).on('value', function (snapshot) {
  const isTyping = snapshot.val();
  typingStatus.textContent = isTyping ? `${otherUser} đang nhập...` : '';
});
