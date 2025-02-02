export default function handler(req, res) {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    if (!global.messages) {
      global.messages = [];
    }
    res.status(200).json(global.messages);
  }
  