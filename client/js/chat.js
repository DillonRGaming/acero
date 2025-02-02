const username = localStorage.getItem("username");
const avatar = localStorage.getItem("avatar") || "https://via.placeholder.com/40";
if (!username) {
  window.location.href = "index.html";
}

function fetchMessages() {
  fetch("/api/messages")
    .then(res => res.json())
    .then(data => {
      const chatMessagesDiv = document.getElementById("chatMessages");
      chatMessagesDiv.innerHTML = "";
      data.forEach(msg => {
        appendMessage(msg);
      });
    })
    .catch(err => {
      console.error("Error fetching messages:", err);
    });
}

function appendMessage(msg) {
  const chatMessagesDiv = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `
    <div class="avatar"><img src="${msg.avatar || 'https://via.placeholder.com/40'}" alt="${msg.username}"></div>
    <div class="message-content">
      <span class="username">${msg.username}</span>
      <span class="timestamp">${msg.timestamp}</span>
      <p>${msg.text}</p>
    </div>
  `;
  chatMessagesDiv.appendChild(messageDiv);
}

setInterval(fetchMessages, 2000); // Poll messages every 2 seconds
fetchMessages();

document.getElementById("messageInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter" && this.value.trim() !== "") {
    const text = this.value;
    fetch("/api/send_message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, text, avatar })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        this.value = "";
        fetchMessages();
      }
    })
    .catch(err => {
      console.error("Error sending message:", err);
    });
  }
});
