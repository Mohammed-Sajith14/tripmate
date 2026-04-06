# Real-Time Messaging System - Setup & Testing Guide

## Installation

### Backend
```bash
cd backend
npm install
```

This will install Socket.io dependency along with other packages.

### Frontend
```bash
cd frontend
npm install
```

This will install socket.io-client dependency.

## Running the System

### Start Backend Server
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
# or
npm start    # Single run
```

The server will start on `http://localhost:5000` with WebSocket on `ws://localhost:5000`

### Start Frontend
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Testing the Messaging System

### Manual Testing Steps

1. **Create Two Test Accounts**
   - Register as User A (traveler)
   - Register as User B (organizer or another traveler)

2. **Follow Each Other** (for direct messaging)
   - User A follows User B
   - User B follows User A (optional, depends on your follow logic)

3. **Test Direct Messaging**
   - User A opens Messages page
   - If conversation doesn't exist, create one via "Start Conversation"
   - Send message from User A to User B
   - Verify message appears in real-time on both ends
   - Test read receipts

4. **Test Trip Inquiry**
   - Create a trip as User B (organizer)
   - User A visits trip details
   - Click "Ask Organizer Your Doubts & Questions"
   - Send inquiry message
   - Verify trip_inquiry conversation is created

5. **Test Real-Time Features**
   - Open two browser windows/tabs
   - Login as different users
   - Send messages and verify instant delivery
   - Check typing indicators
   - Verify read receipts

### API Testing with Postman

#### Get User's Conversations
```
GET http://localhost:5000/api/messages
Headers: Authorization: Bearer {TOKEN}
```

#### Get Specific Conversation
```
GET http://localhost:5000/api/messages/{CONVERSATION_ID}
Headers: Authorization: Bearer {TOKEN}
```

#### Start New Conversation
```
POST http://localhost:5000/api/messages/start
Headers: Authorization: Bearer {TOKEN}
Body: {
  "otherUserId": "USER_ID_OR_OBJECT_ID",
  "type": "direct"
}
```

#### Start Trip Inquiry
```
POST http://localhost:5000/api/messages/inquiry/start
Headers: Authorization: Bearer {TOKEN}
Body: {
  "tripId": "TRIP_ID",
  "initialMessage": "Do you have any dietary restrictions?"
}
```

#### Send Message (REST Fallback)
```
POST http://localhost:5000/api/messages/{CONVERSATION_ID}/send
Headers: Authorization: Bearer {TOKEN}
Body: {
  "content": "Message content here"
}
```

#### Mark as Read
```
PATCH http://localhost:5000/api/messages/{CONVERSATION_ID}/read
Headers: Authorization: Bearer {TOKEN}
```

## Socket.io Events

### Client to Server Events
```typescript
socket.emit('user_connected', userId)
socket.emit('join_conversation', conversationId)
socket.emit('send_message', {
  conversationId,
  senderId,
  content,
  timestamp
})
socket.emit('mark_as_read', { messageId, conversationId })
socket.emit('user_typing', { conversationId, userId })
socket.emit('user_stopped_typing', { conversationId, userId })
```

### Server to Client Events
```typescript
socket.on('message_received', message)
socket.on('message_read', { messageId })
socket.on('user_typing', { userId })
socket.on('user_stopped_typing', { userId })
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/tripmate
JWT_SECRET=your_secret_key
JWT_EXPIRE=1h
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
No additional Socket.io configuration needed - it auto-connects to backend API URL

## Troubleshooting

### Socket.io Not Connecting
1. Verify backend server is running on port 5000
2. Check CORS configuration in `server.js`
3. Ensure frontend URL matches CORS origin
4. Check browser console for connection errors

### Messages Not Sending
1. Verify JWT token is stored in localStorage
2. Check network tab for failed requests
3. Verify both users are participants in conversation
4. Check MongoDB connection

### Messages Not Appearing Real-Time
1. Verify Socket.io connected (should log "Socket connected")
2. Check that user joined conversation room
3. Verify other user is in same room
4. Check for JavaScript errors in console

### Unread Counts Not Updating
1. Verify `mark_as_read` events are being sent
2. Check conversation unreadCount map in database
3. Ensure message sender is not marking own messages as read

## Database Schema Reference

### Conversation Document
```javascript
{
  _id: ObjectId,
  participants: [UserId1, UserId2],
  type: "direct" | "trip_inquiry",
  trip: TripId | null,
  lastMessage: {
    content: String,
    sender: UserId,
    timestamp: Date
  },
  unreadCount: Map<UserId, Number>,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Document
```javascript
{
  _id: ObjectId,
  conversation: ConversationId,
  sender: UserId,
  content: String,
  isRead: Boolean,
  readAt: Date | null,
  attachments: [{type, url}],
  createdAt: Date,
  updatedAt: Date
}
```

## Performance Considerations

- Messages are indexed by conversation and creation date
- Conversations sorted by last message timestamp
- Pagination available for long message histories
- Unread counts cached in conversation document
- User presence tracking with Socket.io

## Security Features

- JWT authentication required for all endpoints
- User authorization checks (only participants can access)
- No direct database access from frontend
- CORS enabled for frontend only
- Socket.io connected to authenticated users only

## Next Steps

1. Test thoroughly with multiple users
2. Monitor Socket.io connection stability
3. Set up message notifications
4. Implement message search
5. Add message reactions/emojis
6. Consider implementing end-to-end encryption for sensitive conversations
