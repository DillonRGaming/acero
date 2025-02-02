export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  if (!global.users) {
    global.users = {};
  }
  const { username, password } = req.body;
  if (global.users[username] && global.users[username].password === password) {
    res.status(200).json({ success: true, username, avatar: global.users[username].avatar });
  } else {
    res.status(200).json({ success: false, message: "Invalid credentials" });
  }
}
