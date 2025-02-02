// Prompt for a username
let username = prompt("Enter your username:") || "Anonymous";
let currentChannel = "general";

// Connect to the WebSocket server
const ws = new WebSocket("ws://localhost:8765");

ws.onopen = () => {
  console.log("Connected to WebSocket server");
};

ws.onmessage = (event) => {
  // Parse incoming message data (expected to be JSON)
  const msgData = JSON.parse(event.data);
  // Only display messages for the current channel
  if (msgData.channel === currentChannel) {
    appendMessage(msgData);
  }
};

ws.onclose = () => {
  console.log("Disconnected from WebSocket server");
};

// Append a message to the chat messages container
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

// Send a message when the user presses Enter
document.getElementById("messageInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && this.value.trim() !== "") {
    let msgText = this.value;
    let time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const messageData = {
      channel: currentChannel,
      username: username,
      timestamp: time,
      text: msgText,
    };
    // Send the message as a JSON string
    ws.send(JSON.stringify(messageData));
    // Optionally, display your own message immediately
    appendMessage(messageData);
    this.value = "";
  }
});

// Handle channel switching
document.querySelectorAll(".channel-item").forEach((item) => {
  item.addEventListener("click", () => {
    // Update active channel item styling
    document.querySelectorAll(".channel-item").forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    // Set the current channel and update header text
    currentChannel = item.getAttribute("data-channel");
    document.querySelector(".chat-header h2").textContent = `# ${currentChannel}`;

    // Clear the current chat messages when switching channels
    document.getElementById("chatMessages").innerHTML = "";
  });
});
