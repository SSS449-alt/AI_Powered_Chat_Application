(() => {
  const socket = io();
  const welcomeScreen = document.getElementById('welcomeScreen');
  const chatScreen = document.getElementById('chatScreen');
  const joinForm = document.getElementById('joinForm');
  const usernameInput = document.getElementById('username');
  const joinError = document.getElementById('joinError');
  const messageForm = document.getElementById('messageForm');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const messages = document.getElementById('messages');
  const userList = document.getElementById('userList');
  const userCount = document.getElementById('userCount');
  const statusDot = document.getElementById('statusDot');
  const connectionText = document.getElementById('connectionText');
  const charCount = document.getElementById('charCount');
  const leaveBtn = document.getElementById('leaveBtn');
  let username = '';
  let joined = false;

  socket.on('connect', () => {
    statusDot.classList.add('online');
    connectionText.textContent = 'Server connected';
    if (username && !joined) socket.emit('join_chat', { username });
  });
  socket.on('disconnect', () => {
    statusDot.classList.remove('online');
    connectionText.textContent = 'Reconnecting…';
    joined = false;
    messageInput.disabled = true;
    sendBtn.disabled = true;
  });
  socket.on('join_error', data => {
    joinError.textContent = data.message || 'Could not join. Please try again.';
    joined = false;
    welcomeScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
  });
  socket.on('joined', data => {
    username = data.username;
    joined = true;
    joinError.textContent = '';
    welcomeScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
    renderUsers(data.users || []);
  });
  socket.on('chat_history', history => {
    messages.innerHTML = '';
    if (!history.length) showEmpty();
    history.forEach(addMessage);
  });
  socket.on('new_message', addMessage);
  socket.on('system_message', data => {
    removeEmpty();
    const el = document.createElement('div');
    el.className = 'system-message';
    el.textContent = `${data.text} · ${data.time}`;
    messages.appendChild(el);
    scrollToBottom();
  });
  socket.on('user_list', renderUsers);

  joinForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (!name) { joinError.textContent = 'Please enter a display name.'; return; }
    if (!socket.connected) { joinError.textContent = 'The server is not connected yet. Please wait a moment.'; return; }
    username = name;
    joinError.textContent = '';
    socket.emit('join_chat', { username });
  });

  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message || !joined) return;
    socket.emit('send_message', { message });
    messageInput.value = '';
    charCount.textContent = '0';
    messageInput.focus();
  });
  messageInput.addEventListener('input', () => charCount.textContent = messageInput.value.length);
  leaveBtn.addEventListener('click', () => {
    // Reloading closes the socket cleanly and returns to the join screen.
    username = '';
    joined = false;
    socket.disconnect();
    welcomeScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    usernameInput.value = '';
    messageInput.value = '';
    charCount.textContent = '0';
    socket.connect();
  });

  function renderUsers(users) {
    userCount.textContent = users.length;
    userList.innerHTML = '';
    users.forEach(name => {
      const li = document.createElement('li');
      const avatar = document.createElement('span');
      avatar.className = 'user-avatar';
      avatar.textContent = name.slice(0, 2).toUpperCase();
      const label = document.createElement('span');
      label.className = 'user-name';
      label.textContent = name + (name === username ? ' (you)' : '');
      li.append(avatar, label);
      userList.appendChild(li);
    });
  }
  function addMessage(data) {
    removeEmpty();
    const row = document.createElement('div');
    row.className = 'message-row' + (data.username === username ? ' mine' : '');
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = (data.username || '?').slice(0, 2).toUpperCase();
    const content = document.createElement('div');
    content.className = 'message-content';
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const name = document.createElement('span');
    name.className = 'message-name';
    name.textContent = data.username;
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = data.time;
    meta.append(name, time);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = data.message;
    content.append(meta, bubble);
    row.append(avatar, content);
    messages.appendChild(row);
    scrollToBottom();
  }
  function showEmpty() {
    if (document.getElementById('emptyState')) return;
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.id = 'emptyState';
    empty.innerHTML = "<div class='empty-art'>✳</div><h3>You are at the start of something.</h3><p>Send the first message to get the conversation going.</p>";
    messages.appendChild(empty);
  }
  function removeEmpty() {
    const empty = document.getElementById('emptyState');
    if (empty) empty.remove();
  }
  function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }
})();
