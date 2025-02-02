const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) {
    errorMsg.textContent = "Please fill in both fields.";
    return;
  }
  fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("username", username);
      localStorage.setItem("avatar", data.avatar || "");
      window.location.href = "chat.html";
    } else {
      errorMsg.textContent = data.message;
    }
  })
  .catch(err => {
    errorMsg.textContent = "Error logging in.";
  });
});
