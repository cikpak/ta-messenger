// messenger.js - Protected messenger functionality with JWT
import authService from './auth.js';

// Check authentication on page load
if (!authService.isAuthenticated()) {
    window.location.href = '/login.html';
}

// Get current user info
const currentUser = authService.getCurrentUser();

// WebSocket connection for real-time messaging
let ws = null;

// Initialize messenger
const initializeMessenger = () => {
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Load chat list
    loadChatList();
    
    // Setup event listeners
    setupEventListeners();
    
    // Periodically check token validity
    setInterval(checkTokenValidity, 60000);
}

// Initialize WebSocket for real-time messaging
const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:3000/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        
        // Send authentication token
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
        // Attempt to reconnect after 3 seconds
        setTimeout(initializeWebSocket, 3000);
    };
}

// Handle incoming WebSocket messages
const handleWebSocketMessage = (data) => {
    switch(data.type) {
        case 'message':
            displayNewMessage(data.message);
            break;
        case 'new_chat':
            handleNewChat(data.chat);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

// Handle a new user/chat broadcasted from backend
const handleNewChat = (chat) => {
    const chatsList = document.getElementById('chats-list');
    if (!chatsList) return;

    // Avoid adding self
    if (chat.id === currentUser.id) return;

    // Check if chat already exists
    if (document.querySelector(`[data-chat-id="${chat.id}"]`)) return;

    const chatItem = createChatItem(chat);
    chatsList.prepend(chatItem);
}

// Load chat list from server
const loadChatList = async () => {
    try {
        const response = await authService.authenticatedRequest('http://localhost:3000/api/chats');
        const chats = await response.json();
        
        displayChatList(chats);
    } catch (error) {
        console.error('Failed to load chats:', error);
    }
}

// Display chat list in sidebar
const displayChatList = (chats) => {
    const chatsList = document.getElementById('chats-list');
    if (!chatsList) return;
    
    // Clear existing chats
    chatsList.innerHTML = '';
    
    // Add each chat
    chats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatsList.appendChild(chatItem);
    });
}

// Create a chat item element
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
    `;
    
    div.addEventListener('click', () => selectChat(chat.id));
    return div;
}

// Select and load a chat
const selectChat = async (chatId) => {
    // Update UI to show selected chat
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('chat-active');
    });
    
    const selectedChat = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (selectedChat) {
        selectedChat.classList.add('chat-active');
    }
    
    // Load messages for this chat
    await loadMessages(chatId);
}

// Load messages for a specific chat
const loadMessages = async (chatId) => {
    try {
        const response = await authService.authenticatedRequest(`http://localhost:3000/api/chats/${chatId}/messages`);
        const messages = await response.json();
        
        displayMessages(messages);
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Display messages in the chat area
const displayMessages = (messages) => {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    // Clear existing messages except date divider
    const dateDivider = messagesContainer.querySelector('.date-divider');
    messagesContainer.innerHTML = '';
    if (dateDivider) {
        messagesContainer.appendChild(dateDivider);
    }
    
    // Add messages
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    const container = document.getElementById('messages-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Create a message element
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

// Display a new incoming message
const displayNewMessage = (message) => {
    const messagesContainer = document.getElementById('messages');
    
    if (!messagesContainer) return;
    
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    const container = document.getElementById('messages-container');

    if (container) {
        container.scrollTop = container.scrollHeight;
    }
    
    // Update chat list preview
    updateChatPreview(message.chatId, message.content, message.timestamp);
}

// Update chat preview in sidebar
const updateChatPreview = (chatId, lastMessage, timestamp) => {
    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (!chatItem) return;
    
    const preview = chatItem.querySelector('.message-preview');
    const time = chatItem.querySelector('.last-activity');
    
    if (preview) preview.textContent = lastMessage;
    if (time) time.textContent = formatTime(timestamp);
}

// Setup event listeners
const setupEventListeners = () => {
    // Message input
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-icon-wrapper');
    
    if (messageInput && sendButton) {
        // Send on Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Send on button click
        sendButton.addEventListener('click', sendMessage);
    }
}

// Send a message
const sendMessage = async () => {
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !messageInput.value.trim()) return;
    
    const content = messageInput.value.trim();
    const activeChat = document.querySelector('.chat-active');
    
    if (!activeChat) {
        alert('Please select a chat first');
        return;
    }
    
    const chatId = activeChat.dataset.chatId;
    
    try {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',
                chatId: chatId,
                content: content
            }));
        }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

// Check token validity
const checkTokenValidity = () => {
    if (!authService.isAuthenticated()) {
        alert('Your session has expired. Please login again.');

        authService.removeToken();
        window.location.href = '/login.html';
    }
}

// Utility functions
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMessenger);
} else {
    initializeMessenger();
}

export { initializeMessenger };
