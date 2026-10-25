# Distributed Chat System

A beginner-friendly, responsive real-time chat web application based on the supplied mini-project abstract. It demonstrates how multiple clients exchange messages through a central server.

## Features

- Join using a display name (no password required for this demo)
- Send and receive messages in real time
- See currently connected users
- See join/leave notifications
- Retains the latest 100 messages while the server is running
- Responsive layout for desktop, tablet, and mobile
- Input is rendered as text, not HTML, to avoid interpreting messages as markup

## Technology

- **Python + Flask** — serves the web application
- **Flask-SocketIO / Socket.IO** — real-time two-way communication
- **HTML** — page structure
- **CSS** — responsive design
- **JavaScript** — browser-side chat behavior

> The supplied abstract mentions Python, Socket Programming, and Tkinter. Tkinter is for desktop interfaces, so this web version uses HTML/CSS/JavaScript for the browser interface and Socket.IO for live network communication. It preserves the abstract's main idea: multiple clients communicate through a client-server application.

## Run locally (Windows)

1. Install Python 3.10 or newer from https://www.python.org/downloads/ and enable **Add Python to PATH**.
2. Extract this ZIP file.
3. Open Command Prompt or PowerShell inside the `distributed-chat-system` folder.
4. Create a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   If PowerShell blocks activation, use Command Prompt and run:

   ```bat
   .venv\Scripts\activate.bat
   ```

5. Install dependencies:

   ```powershell
   python -m pip install -r requirements.txt
   ```

6. Start the server:

   ```powershell
   python app.py
   ```

7. Open http://127.0.0.1:5000 in your browser.
8. To demonstrate multiple users, open the same address in two different browser tabs or on two devices connected to the same network. Enter different display names.

### Testing from another device on the same Wi-Fi

On the computer running the server, find its local IPv4 address with `ipconfig`. On the second device, open `http://YOUR-COMPUTER-IP:5000`. Both devices must be on the same network, and Windows Firewall may ask you to allow Python on a private network.

## How it works

```text
Browser A ── message ──┐
                       ▼
                 Python server
                 (Flask-SocketIO)
                       │
                       ├── broadcasts message to all connected clients
                       ▼
Browser B ◀── message ─┘
```

1. A user enters a display name and joins.
2. The browser opens a Socket.IO connection to the Python server.
3. When the user sends a message, the browser sends it to the server.
4. The server checks that the user has joined, stores the message in temporary memory, and broadcasts it to connected browsers.
5. The browsers display the message and update the online-user list.

## Project structure

```text
distributed-chat-system/
├── app.py                  # Python server and chat event handlers
├── requirements.txt        # Python dependencies
├── README.md               # Setup and explanation
├── .gitignore
├── templates/
│   └── index.html          # Web page layout
└── static/
    ├── css/
    │   └── style.css       # Responsive styles
    └── js/
        └── app.js          # Socket connection and chat UI
```

## Presentation demo

1. Start the server and open the app in two browser tabs.
2. Join as `Student A` in the first tab and `Student B` in the second.
3. Send a message from one tab and show it appearing in both.
4. Show the online-user list and the join/leave notification.
5. Explain: browsers are clients, `app.py` is the server, and Socket.IO carries events between them.

## Scope and limitations

- This is a learning/demo project, not a production messaging service.
- Usernames are not passwords or verified identities.
- Messages and online users are kept in server memory; message history resets when the server stops.
- For simplicity, all users share one public room.
- The browser loads the Socket.IO client library from a CDN, so internet access is needed for that script.
- For deployment on the public internet, add authentication, persistent storage, rate limits, HTTPS, and production server configuration.
