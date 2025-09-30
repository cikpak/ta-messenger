import authService from './auth.js';

if (!authService.isAuthenticated()) {
    window.location.href = '/login.html';
}

const currentUser = authService.getCurrentUser();
let ws = null;

const initializeMessenger = () => {
    initializeWebSocket();
    
    loadChatList();
    
    setupEventListeners();
    
    setInterval(checkTokenValidity, 60000);
}

const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:3000/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        
        ws.send(JSON.stringify({
            type: 'auth',
            token: authService.token
        }));
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(initializeWebSocket, 3000);
    };
}

const handleWebSocketMessage = (data) => {
    switch (data.type) {
        case 'message':
            displayNewMessage(data.message);
            break;
        case 'new_chat':
            handleNewChat(data.chat);
            break;
    
        default:
            console.log('Unknown message!', data.type);
            break;
    }
}

const handleNewChat = (chat) => {
    const chatsList = document.getElementById('chats-list');
    if (!chatsList) return;

    if (chat.id === currentUser.id) return;

    if (document.querySelector(`[data-chat-id="${chat.id}"]`)) return;

    const chatItem = createChatItem(chat);
    chatsList.prepend(chatItem);
}

const loadChatList = async () => {
    try {
        const response = await authService.authenticatedRequest('http://localhost:3000/api/chats');
        const chats = await response.json();

        displayChatList(chats);
    } catch (error) {
        console.log('Error while fetching chats!', error)
    }
}

const displayChatList = (chats) => {
    const chatsList = document.getElementById('chats-list');

    chatsList.innerHTML = '';

    chats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatsList.appendChild(chatItem);
    })
}

const createChatItem = (chat) => {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;

    div.innerHTML = `
        <div class="avatar avatar-small">
                <img src="${chat.avatar || './images/users/user-1.png'}" alt="${chat.name}">
        </div>

        <div>
            <div class="chat-details">
                <span class="chat-name">${chat.name}</span>
                <span class="last-activity">${formatTime(chat.lastActivity)}</span>
            </div>

            <div class="message-preview">
                ${chat.lastMessage || 'No messages yet'}
            </div>
        </div>
    `

    div.addEventListener('click', () => selectChat(chat.id));
    return div;
}

const selectChat = async (chatId) => {
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('chat-active');
    });
    
    const selectedChat = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (selectedChat) {
        selectedChat.classList.add('chat-active');
    }
    
    await loadMessages(chatId);
}

const loadMessages = async (chatId) => {
    try {
        const response = await authService.authenticatedRequest(`http://localhost:3000/api/chats/${chatId}/messages`);
        const messages = await response.json();
        
        displayMessages(messages);
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

const displayMessages = (messages) => {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });
    
    const container = document.getElementById('messages-container');
    
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

const createMessageElement = (message) => {
    const div = document.createElement('div');
    const isSent = message.senderId === currentUser.id;
    div.className = `message ${isSent ? 'message-sent' : 'message-received'}`;
    
    div.innerHTML = `
        <div class="avatar avatar-small">
            <img src="${message.avatar || './images/users/user-1.png'}" alt="${message.senderName}">
        </div>

        <div class="message-body">
            <div class="message-content">
                <p>${escapeHtml(message.content)}</p>
            </div>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
    `;
    
    return div;
}

const displayNewMessage = (message) => {
    const messagesContainer = document.getElementById('messages');
    
    if (!messagesContainer) return;
    
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    
    const container = document.getElementById('messages-container');

    if (container) {
        container.scrollTop = container.scrollHeight;
    }
    
    updateChatPreview(message.chatId, message.content, message.timestamp);
}

const updateChatPreview = (chatId, lastMessage, timestamp) => {
    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (!chatItem) return;
    
    const preview = chatItem.querySelector('.message-preview');
    const time = chatItem.querySelector('.last-activity');
    
    if (preview) preview.textContent = lastMessage;
    if (time) time.textContent = formatTime(timestamp);
}

const sendMessage = async () => {
    const messageInput = document.getElementById('message-input');

    const content = messageInput.value.trim();
    const activeChat = document.querySelector('.chat-active');

    if(activeChat == null) {
        alert('Please select a chat first!')
    }

    const chatId = activeChat.dataset.chatId;

    try {
        if(ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                chatId: chatId,
                content: content,
                type: 'message'
            }))

            messageInput.value = '';
        }
    } catch (error) {
        console.log('Error while sending message!', error)
    }
}

const setupEventListeners = () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-icon-wrapper');
    
    if (messageInput && sendButton) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        sendButton.addEventListener('click', sendMessage);
    }
}

const checkTokenValidity = () => {
    if (!authService.isAuthenticated()) {
        alert('Your session has expired. Please login again.');

        authService.removeToken();
        window.location.href = '/login.html';
    }
}

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    return date.toLocaleDateString();
}

const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMessenger);
} else {
    initializeMessenger();
}

export { initializeMessenger };
