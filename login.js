const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// Update this URL when you deploy your WebSocket server.
const ws = new WebSocket('ws://localhost:8765');

ws.onopen = () => {
  console.log('Connected to server for login');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'login_success') {
    // Cache credentials so the user remains logged in.
    localStorage.setItem('username', data.username);
    localStorage.setItem('password', document.getElementById('password').value);
    window.location.href = 'chat.html';
  } else if (data.type === 'login_failed') {
    errorMsg.textContent = data.reason;
  }
};

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    errorMsg.textContent = 'Please enter both username and password.';
    return;
  }
  const loginRequest = { type: 'login', username, password };
  ws.send(JSON.stringify(loginRequest));
});
