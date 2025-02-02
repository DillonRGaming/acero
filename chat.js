// Retrieve cached credentials.
let username = localStorage.getItem('username');
let password = localStorage.getItem('password');

if (!username || !password) {
  window.location.href = 'login.html';
}

let currentChannel = "general";
// Update this URL when you deploy your WebSocket server.
const ws = new WebSocket("ws://localhost:8765");

ws.onopen = () => {
  console.log("Connected to WebSocket server in chat");
  // Reauthenticate using cached credentials.
  const loginRequest = { type: "login", username, password };
  ws.send(JSON.stringify(loginRequest));
};

ws.onmessage = (event) => {
  const msgData = JSON.parse(event.data);

  if (msgData.type === "login_success") {
    console.log("Re-authenticated in chat");
    return;
  }
  if (msgData.type === "login_failed") {
    window.location.href = 'login.html';
    return;
  }
  if (msgData.type === "history") {
    // Load the full chat history.
    msgData.messages.forEach(msg => {
      if (msg.channel === currentChannel) {
        appendMessage(msg);
      }
    });
    return;
  }
  if (msgData.type === "chat" && msgData.channel === currentChannel) {
    appendMessage(msgData);
  }
};

ws.onclose = () => {
  console.log("Disconnected from WebSocket server");
};

function appendMessage(data) {
  const chatMessagesDiv = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `
    <div class="avatar"></div>
    <div class="message-content">
      <div>
        <span class="username">${data.username}</span>
        <span class="timestamp">${data.timestamp}</span>
      </div>
      <p>${data.text}</p>
    </div>
  `;
  chatMessagesDiv.appendChild(messageDiv);
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

document.getElementById("messageInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && this.value.trim() !== "") {
    let msgText = this.value;
    let time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const messageData = {
      type: "chat",
      channel: currentChannel,
      username: username, // Server will override with authenticated username.
      timestamp: time,
      text: msgText,
    };
    ws.send(JSON.stringify(messageData));
    appendMessage(messageData);
    this.value = "";
  }
});

// Settings modal functionality.
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeModal = document.getElementById("closeModal");
const logoutBtn = document.getElementById("logoutBtn");

settingsBtn.onclick = function() {
  settingsModal.style.display = "block";
};
closeModal.onclick = function() {
  settingsModal.style.display = "none";
};
logoutBtn.onclick = function() {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  window.location.href = "login.html";
};
window.onclick = function(event) {
  if (event.target == settingsModal) {
    settingsModal.style.display = "none";
  }
};
