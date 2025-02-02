export default function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    if (!global.users) {
      global.users = {};
    }
    const { username, password, avatar } = req.body;
    if (global.users[username]) {
      res.status(200).json({ success: false, message: "User already exists" });
    } else {
      global.users[username] = { password, avatar };
      res.status(200).json({ success: true });
    }
  }
  