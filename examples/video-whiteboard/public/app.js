// Initialize variables
let socket;
let peer;
let localStream;
let roomId;
let userId;
let isDrawing = false;
let currentColor = '#000000';
let currentSize = 3;
let isEraser = false;
let drawingHistory = [];
let lastPoint = null;

// DOM elements
const roomModal = document.getElementById('roomModal');
const roomInput = document.getElementById('roomInput');
const joinBtn = document.getElementById('joinBtn');
const roomIdElement = document.getElementById('roomId');
const copyRoomBtn = document.getElementById('copyRoomBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const waitingMessage = document.getElementById('waitingMessage');
const toggleVideoBtn = document.getElementById('toggleVideo');
const toggleAudioBtn = document.getElementById('toggleAudio');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const connectionStatus = document.getElementById('connectionStatus');
const statusIndicator = connectionStatus.querySelector('.status-indicator');
const statusText = connectionStatus.querySelector('.status-text');

// Whiteboard elements
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorBtns = document.querySelectorAll('.color-btn');
const brushSizeInput = document.getElementById('brushSize');
const sizeValue = document.getElementById('sizeValue');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize canvas
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// Generate room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Initialize socket connection
function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
        updateConnectionStatus('connecting');
    });

    socket.on('room-users', (data) => {
        userId = data.yourId;
        console.log('Room users:', data.roomUsers);
        
        if (data.roomUsers.length > 1) {
            // Start peer connection as initiator if you're the second user
            const otherUser = data.roomUsers.find(id => id !== userId);
            if (otherUser && !peer) {
                createPeer(true, otherUser);
            }
        }
    });

    socket.on('user-joined', (data) => {
        console.log('User joined:', data.userId);
        if (!peer) {
            createPeer(false, data.userId);
        }
    });

    socket.on('signal', (data) => {
        console.log('Received signal from:', data.from);
        if (peer) {
            peer.signal(data.signal);
        }
    });

    socket.on('user-left', (data) => {
        console.log('User left:', data.userId);
        if (peer) {
            peer.destroy();
            peer = null;
            remoteVideo.srcObject = null;
            waitingMessage.style.display = 'block';
            updateConnectionStatus('waiting');
        }
    });

    socket.on('draw', (data) => {
        drawOnCanvas(data);
    });

    socket.on('clear-board', () => {
        clearCanvas();
    });

    socket.on('undo', () => {
        performUndo();
    });

    socket.on('chat-message', (data) => {
        addChatMessage(data.message, data.from === userId ? 'You' : 'Peer', data.from === userId, data.timestamp);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        updateConnectionStatus('disconnected');
    });
}

// Create WebRTC peer connection
function createPeer(initiator, targetId) {
    console.log('Creating peer, initiator:', initiator);
    
    peer = new SimplePeer({
        initiator: initiator,
        stream: localStream,
        trickle: true,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }
    });

    peer.on('signal', (signal) => {
        socket.emit('signal', {
            to: targetId,
            signal: signal
        });
    });

    peer.on('connect', () => {
        console.log('Peer connected');
        waitingMessage.style.display = 'none';
        updateConnectionStatus('connected');
    });

    peer.on('stream', (stream) => {
        console.log('Received remote stream');
        remoteVideo.srcObject = stream;
    });

    peer.on('data', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'chat') {
            addChatMessage(message.text, 'Peer', false, new Date().toISOString());
        }
    });

    peer.on('close', () => {
        console.log('Peer connection closed');
        remoteVideo.srcObject = null;
        waitingMessage.style.display = 'block';
        updateConnectionStatus('waiting');
    });

    peer.on('error', (err) => {
        console.error('Peer error:', err);
    });
}

// Get user media
async function getUserMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });
        localVideo.srcObject = localStream;
        return true;
    } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Unable to access camera/microphone. Please check permissions.');
        return false;
    }
}

// Update connection status
function updateConnectionStatus(status) {
    statusIndicator.className = 'status-indicator';
    
    switch (status) {
        case 'connected':
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Connected';
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            break;
        case 'waiting':
            statusText.textContent = 'Waiting for peer...';
            break;
        case 'disconnected':
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Disconnected';
            break;
    }
}

// Room management
joinBtn.addEventListener('click', async () => {
    const success = await getUserMedia();
    if (!success) return;

    roomId = roomInput.value.trim() || generateRoomId();
    roomIdElement.textContent = `Room: ${roomId}`;
    
    initSocket();
    socket.emit('join-room', { roomId, userId: socket.id });
    
    roomModal.classList.add('hidden');
});

copyRoomBtn.addEventListener('click', () => {
    const roomText = roomId;
    navigator.clipboard.writeText(roomText).then(() => {
        copyRoomBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyRoomBtn.textContent = '📋 Copy Room ID';
        }, 2000);
    });
});

// Video/Audio controls
toggleVideoBtn.addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        toggleVideoBtn.classList.toggle('active');
        toggleVideoBtn.querySelector('.video-on').style.display = videoTrack.enabled ? 'inline' : 'none';
        toggleVideoBtn.querySelector('.video-off').style.display = videoTrack.enabled ? 'none' : 'inline';
    }
});

toggleAudioBtn.addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        toggleAudioBtn.classList.toggle('active');
        toggleAudioBtn.querySelector('.audio-on').style.display = audioTrack.enabled ? 'inline' : 'none';
        toggleAudioBtn.querySelector('.audio-off').style.display = audioTrack.enabled ? 'none' : 'inline';
    }
});

// Chat functionality
function addChatMessage(message, sender, isOwn, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwn ? 'own' : ''}`;
    
    const time = new Date(timestamp).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="sender">${sender}</div>
        <div class="text">${message}</div>
        <div class="time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message) {
        // Send via socket
        socket.emit('chat-message', { message });
        
        // Send via peer data channel if connected
        if (peer && peer.connected) {
            peer.send(JSON.stringify({ type: 'chat', text: message }));
        }
        
        chatInput.value = '';
    }
}

sendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// Whiteboard functionality
function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPoint = { x, y };
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const drawData = {
        from: lastPoint,
        to: { x, y },
        color: isEraser ? '#FFFFFF' : currentColor,
        size: currentSize,
        isEraser: isEraser
    };
    
    drawOnCanvas(drawData);
    socket.emit('draw', drawData);
    
    lastPoint = { x, y };
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveDrawingState();
    }
}

function drawOnCanvas(data) {
    ctx.globalCompositeOperation = data.isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y);
    ctx.lineTo(data.to.x, data.to.y);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
}

function saveDrawingState() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawingHistory.push(imageData);
    if (drawingHistory.length > 50) {
        drawingHistory.shift();
    }
}

function performUndo() {
    if (drawingHistory.length > 0) {
        drawingHistory.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (drawingHistory.length > 0) {
            ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
        }
    }
}

// Canvas event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Color picker
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.dataset.color;
        isEraser = false;
        eraserBtn.classList.remove('active');
    });
});

// Brush size
brushSizeInput.addEventListener('input', (e) => {
    currentSize = e.target.value;
    sizeValue.textContent = currentSize;
});

// Eraser
eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    eraserBtn.classList.toggle('active');
    if (isEraser) {
        colorBtns.forEach(b => b.classList.remove('active'));
    }
});

// Clear button
clearBtn.addEventListener('click', () => {
    if (confirm('Clear the whiteboard for everyone?')) {
        clearCanvas();
        socket.emit('clear-board');
    }
});

// Undo button
undoBtn.addEventListener('click', () => {
    performUndo();
    socket.emit('undo');
});

// Download button
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
});

// Initialize canvas on load
window.addEventListener('load', () => {
    initCanvas();
});

// Handle window resize
window.addEventListener('resize', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    initCanvas();
    ctx.putImageData(imageData, 0, 0);
});