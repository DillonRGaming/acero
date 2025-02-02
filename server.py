import asyncio
import websockets
import json
import os

USERS_FILE = "users.json"
MESSAGES_FILE = "messages.json"

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def load_messages():
    if not os.path.exists(MESSAGES_FILE):
        return []
    with open(MESSAGES_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_messages(messages):
    with open(MESSAGES_FILE, "w") as f:
        json.dump(messages, f, indent=4)

# Load user credentials and chat history.
users_db = load_users()
messages_history = load_messages()

# Maps websocket connections to authenticated usernames.
authenticated_users = {}

# Keep track of all connected clients.
connected_clients = set()

async def handler(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type")

            if msg_type == "login":
                username = data.get("username")
                password = data.get("password")
                if username in users_db and users_db[username] == password:
                    authenticated_users[websocket] = username
                    response = {"type": "login_success", "username": username}
                    await websocket.send(json.dumps(response))
                    print(f"User {username} logged in.")
                    # Send full chat history.
                    history_response = {"type": "history", "messages": messages_history}
                    await websocket.send(json.dumps(history_response))
                else:
                    response = {"type": "login_failed", "reason": "Invalid credentials."}
                    await websocket.send(json.dumps(response))

            elif msg_type == "signup":
                username = data.get("username")
                password = data.get("password")
                if username in users_db:
                    response = {"type": "signup_failed", "reason": "User already exists."}
                    await websocket.send(json.dumps(response))
                else:
                    users_db[username] = password
                    save_users(users_db)
                    response = {"type": "signup_success", "username": username}
                    await websocket.send(json.dumps(response))
                    print(f"User {username} signed up.")

            elif msg_type == "chat":
                if websocket not in authenticated_users:
                    response = {"type": "error", "reason": "Not authenticated."}
                    await websocket.send(json.dumps(response))
                    continue
                if data.get("channel") == "general":
                    # Ensure the username is from the authenticated mapping.
                    data["username"] = authenticated_users[websocket]
                    messages_history.append(data)
                    save_messages(messages_history)
                    # Broadcast the message to all authenticated clients.
                    for client in connected_clients:
                        if client in authenticated_users:
                            try:
                                await client.send(json.dumps(data))
                            except Exception as e:
                                print(f"Error sending message: {e}")
            else:
                # Handle unknown message types if needed.
                pass
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    finally:
        connected_clients.discard(websocket)
        if websocket in authenticated_users:
            print(f"User {authenticated_users[websocket]} logged out.")
            del authenticated_users[websocket]

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("WebSocket server started on ws://0.0.0.0:8765")
        await asyncio.Future()  # Run forever.

if __name__ == "__main__":
    asyncio.run(main())
