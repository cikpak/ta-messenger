import authService from "./auth.js";

if(!authService.isAuthenticated()) {
    window.location.href = '/login.html'
}

let ws;

const initializeWebSocket = () => {
    const protocol = window.location.protocol === 'https' ? 'wss' : 'ws'; // http / https -> wss / ws
    const wsUrl  = `${protocol}://localhost:3000/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WEB SOCKET CONNECTED');
    }
}

initializeWebSocket();