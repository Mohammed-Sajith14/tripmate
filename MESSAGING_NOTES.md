# Messaging System - Implementation Notes & Best Practices

## Key Implementation Details

### 1. Real-Time Message Delivery

**Socket.io Connection Flow**:
```
Frontend connects to https://localhost:5000
↓
User logs in - userId stored in localStorage
↓
MessagesPage mounts with useSocket hook
↓
Socket connects with reconnection options
↓
User emits 'user_connected' with userId
↓
User joins private room 'user:{userId}'
↓
User joins conversation rooms as they navigate
↓
Messages broadcast to conversation rooms
```

**WebSocket vs REST Fallback**:
- Primary: Socket.io for real-time (low latency)
- Fallback: REST API if Socket.io fails
- Both methods save to database
- UI works with either method

### 2. Message Security

**Authentication**:
- JWT token required on all endpoints
- Token stored in localStorage
- Passed in Authorization header

**Authorization**:
- User must be participant in conversation
- Organizer can receive inquiries without following back
- Message sender verified on server

**No Follow Required For**:
- Trip inquiries (travelers can message organizers directly)
- Users in same conversation already

### 3. Conversation Types

**Direct Messaging** (`type: "direct"`):
- Between two users who follow each other
- Both must be active followers
- Personal messages, tips, coordination

**Trip Inquiry** (`type: "trip_inquiry"`):
- Traveler to organizer about specific trip
- Doesn't require following
- Trip context included
- Used for questions about trip details

### 4. Unread Message Tracking

**Storage**: 
- Unread count stored per user in conversation document
- Update when: message sent, messages read, conversation opened
- Cached for quick retrieval

**Update Flow**:
```
Message sent
↓
Increment unread count for recipient
↓
User opens conversation
↓
Mark all unread messages as read
↓
Set unread count to 0
```

### 5. Optimistic UI Updates

**Message Send**:
```
User sends message
↓
Message immediately added to local state (optimistic)
↓
Socket.io sends to server
↓
Server broadcasts back (confirms)
↓
If server doesn't confirm, message marked as "pending"
```

**Benefits**:
- Appears instant to user
- Better perceived performance
- Server confirms actual delivery

### 6. Typing Indicators

**Implementation**:
```typescript
socket.emit('user_typing', { conversationId, userId })
// In receiving client
socket.on('user_typing', (data) => setIsTyping(true))

// Auto-clear after 3 seconds inactivity
setTimeout(() => setIsTyping(false), 3000)
```

**Use Cases**:
- Shows other user someone is composing
- Prevents message overlap confusion
- Improves conversational feel

## Database Indexes for Performance

```javascript
// conversations collection
db.conversations.createIndex({ "participants": 1 })
db.conversations.createIndex({ "lastMessage.timestamp": -1 })
db.conversations.createIndex({ 
  "participants": 1, 
  "lastMessage.timestamp": -1 
})

// messages collection
db.messages.createIndex({ "conversation": 1, "createdAt": -1 })
db.messages.createIndex({ "sender": 1 })
```

## Memory Management

**Socket.io Active Users Map**:
```javascript
const activeUsers = new Map() // userId -> socketId

// Add on connect
socket.on('user_connected', (userId) => {
  activeUsers.set(userId, socket.id)
})

// Remove on disconnect
socket.on('disconnect', () => {
  activeUsers.delete(userId)
})
```

**Why**: Track who's online for status indicators (future feature)

## Error Scenarios Handled

1. **User Not Authenticated**
   - Redirect to login
   - Clear stored conversations

2. **User Not Participant**
   - Return 403 Forbidden
   - Don't load conversation

3. **Socket Disconnected**
   - Queue messages in localStorage (optional)
   - Retry when reconnected
   - Show "offline" indicator

4. **Message Format Invalid**
   - Return 400 Bad Request
   - Show validation error to user

5. **Trip Not Found**
   - Can't create inquiry conversation
   - Show error modal

## Performance Considerations

### Message Pagination
```typescript
// Get messages with pagination
GET /api/messages/:conversationId?page=1&limit=50

// Response includes:
- messages: Message[]
- totalMessages: number
- currentPage: number

// Load older messages on scroll-up
```

### Conversation Pagination
```typescript
// Get conversations with pagination
GET /api/messages?page=1&limit=20

// Only load first 20 conversations
// Load more as user scrolls
```

### Database Queries
- Always use indexes for conversations.participants
- Limit message loads with pagination
- Cache last message in conversation doc
- Use .lean() for read-only queries

## Production Deployment Considerations

### Environment Variables Needed
```env
# Backend
MONGODB_URI=           # Full MongoDB connection string
JWT_SECRET=            # Strong random secret
JWT_EXPIRE=            # Token expiration (e.g., "24h")
FRONTEND_URL=          # Full frontend URL for CORS
PORT=                  # Server port (default 5000)
NODE_ENV=production    # Production flag

# Frontend
VITE_API_URL=          # Full backend API URL
```

### Socket.io Production Settings
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'], // Fallback to polling
  maxHttpBufferSize: 1e6,                // 1MB max message size
  pingInterval: 25000,                   // Ping frequency
  pingTimeout: 20000,                    // Timeout for pings
  reconnection: {
    delay: 1000,
    delayMax: 5000,
    attempts: 5
  }
})
```

### Load Balancing
If using multiple server instances:
```javascript
// Share sessions across servers
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"

const pubClient = createClient()
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

### Monitoring
```javascript
// Track connection metrics
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected - Total: ${io.engine.clientsCount}`)
})

// Log message metrics
socket.on('send_message', (data) => {
  console.log(`Message sent - Size: ${data.content.length}`)
})
```

## Testing Recommendations

### Unit Tests
```typescript
// Test message formatting
- formatTimestamp()
- filterConversations()
- mapConversationData()
```

### Integration Tests
```typescript
- Socket.io connection flow
- Message save to database
- Conversation creation
- Unread count updates
```

### E2E Tests
```typescript
// Using Cypress or similar
- User A sends message to User B
- User B receives message in real-time
- Message marked as read
- Unread count updated
- Trip inquiry flow
```

### Load Testing
```typescript
// Using k6 or Apache JMeter
- 1000+ concurrent users
- 100+ messages per second
- Message delivery latency
- Socket reconnection under load
```

## Future Enhancements

### Phase 2
- [ ] Message reactions/emojis
- [ ] Message editing
- [ ] Message deletion
- [ ] File/image uploads
- [ ] User online/offline status

### Phase 3
- [ ] Group conversations
- [ ] Conversation pinning
- [ ] Message search
- [ ] Conversation archiving
- [ ] User blocking

### Phase 4
- [ ] End-to-end encryption
- [ ] Voice messages
- [ ] Video call integration
- [ ] Message scheduling
- [ ] Chatbots for FAQ

## Debugging Tips

### Check Socket Connection
```javascript
// In browser console
socket.connect()
socket.connected // true/false
socket.id         // Current socket ID
```

### Listen to All Events
```javascript
socket.onAny((event, ...args) => {
  console.log(`Event: ${event}`, args)
})
```

### Test Message Flow
```javascript
// Send test message via console
socket.emit('send_message', {
  conversationId: 'test-id',
  senderId: 'user-id',
  content: 'Test message',
  timestamp: new Date().toISOString()
})
```

### Check Database
```javascript
// MongoDB shell
db.conversations.findOne()
db.messages.find({conversation: ObjectId("...")}).pretty()
```

### Monitor Socket.io
```javascript
// Backend: Track active connections
setInterval(() => {
  console.log(`Active connections: ${io.engine.clientsCount}`)
}, 60000)
```

## Troubleshooting Common Issues

### "Socket not connected" but messages not sending
- Check JWT token validity
- Verify Socket.io backend running
- Check browser console for errors
- Try REST API fallback

### Messages appearing out of order
- Ensure timestamps consistent (server-side generation)
- Sort messages by createdAt in database
- Sort response array client-side

### Unread count not updating
- Verify mark_as_read event emitted
- Check conversation document in database
- Ensure user ID correctly identified

### Conversations not loading
- Check MongoDB connection
- Verify user ID valid
- Check JWT token expiration
- Review server logs

## Code Quality Notes

### Naming Conventions
- `conversationId` / `_id` - Handled both ways
- `userId` vs `UserId` vs `_id` - Be consistent
- `isSent` - Boolean for message direction
- `unreadCount` - Number, not boolean

### Type Safety
- Use TypeScript interfaces for all data
- Validate incoming Socket.io data
- Check user authorization before actions

### Error Messages
- Be specific in error responses
- Include field names in validation errors
- Avoid exposing internal system details

### Comments
- Document complex Socket.io logic
- Explain non-obvious authorization checks
- Note any temporary workarounds
