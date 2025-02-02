export default function handler(req, res) {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    if (!global.messages) {
      global.messages = [];
    }
    const { username, text, avatar } = req.body;
    const timestamp = new Date().toLocaleTimeString();
    const message = { username, text, avatar, timestamp };
    global.messages.push(message);
    res.status(200).json({ success: true });
  }
  