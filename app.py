from datetime import datetime
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-for-production"
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# Demo-only in-memory user list and message history. Data resets when the server stops.
online_users = {}
message_history = []
MAX_HISTORY = 100

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("join_chat")
def handle_join(data):
    username = (data or {}).get("username", "").strip()[:24]
    if not username:
        emit("join_error", {"message": "Please enter a username."})
        return

    # Keep usernames unique while connected.
    existing = {name.lower() for name in online_users.values()}
    if username.lower() in existing:
        emit("join_error", {"message": "That username is already in use. Try another one."})
        return

    online_users[request.sid] = username
    emit("chat_history", message_history)
    emit("joined", {"username": username, "users": sorted(online_users.values(), key=str.lower)})
    emit("system_message", {"text": f"{username} joined the chat.", "time": now_time()}, broadcast=True, include_self=False)
    emit("user_list", sorted(online_users.values(), key=str.lower), broadcast=True)

@socketio.on("send_message")
def handle_message(data):
    username = online_users.get(request.sid)
    if not username:
        emit("join_error", {"message": "Join the chat before sending messages."})
        return

    text = (data or {}).get("message", "").strip()
    if not text:
        return
    text = text[:1000]
    message = {
        "username": username,
        "message": text,
        "time": now_time(),
        "kind": "chat"
    }
    message_history.append(message)
    del message_history[:-MAX_HISTORY]
    emit("new_message", message, broadcast=True)

@socketio.on("disconnect")
def handle_disconnect(reason=None):
    username = online_users.pop(request.sid, None)
    if username:
        emit("system_message", {"text": f"{username} left the chat.", "time": now_time()}, broadcast=True)
        emit("user_list", sorted(online_users.values(), key=str.lower), broadcast=True)

def now_time():
    return datetime.now().strftime("%I:%M %p").lstrip("0")

if __name__ == "__main__":
    print("Distributed Chat System running at http://127.0.0.1:5000")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
