# TripMate Messaging System - Architecture Diagrams

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TRIPMATE MESSAGING                         │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────┐
                    │   FRONTEND (React + TS)      │
                    │  - MessagesPage             │
                    │  - ChatWindow               │
                    │  - ConversationList         │
                    │  - TripDetailPage           │
                    └──────────┬───────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         Socket.io (Primary)         REST API (Fallback)
         WebSocket                   HTTP/HTTPS
                │                             │
                │                             │
                ▼                             ▼
    ┌───────────────────────────────────────────────────┐
    │         BACKEND (Node.js + Express)              │
    │  - Socket.io Server                             │
    │  - Message Routes & Controllers                 │
    │  - User Rooms Management                        │
    │  - Event Broadcasting                           │
    └──────────────┬────────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌──────────┐
    │JWT Auth│ │validate│ │Broadcast │
    │        │ │Data    │ │Messages  │
    └────────┘ └────────┘ └──────────┘
         │         │         │
         └─────────┼─────────┘
                   │
                   ▼
         ┌──────────────────┐
         │    MongoDB       │
         │  Conversations   │
         │  Messages        │
         │  Users           │
         └──────────────────┘
```

## 2. Message Flow Diagram

### Real-Time Message Delivery (Socket.io)
```
┌──────────────┐               Socket.io Server              ┌──────────────┐
│   User A     │                                             │   User B     │
│  (Sender)    │                                             │  (Receiver)  │
└──────┬───────┘                                             └──────┬───────┘
       │                                                             │
       │ 1. emit('send_message', {                                 │
       │      conversationId, content, ...                         │
       │    })                                                      │
       ├──────────────────────────────────────┐                    │
       │                                      │                    │
       │         Socket.io Room Management    │                    │
       │         conversation:{id}            │                    │
       │                                      │                    │
       │  2. Database Operations              │                    │
       │     - Save message                   │                    │
       │     - Update conversation            │                    │
       │     - Update unread count            │                    │
       │                                      │                    │
       │  3. Broadcast to room               │                    │
       │     emit('message_received')         ├──────────────────►│
       │                                      │                    │
       │  4. Client receives event           │                    │
       │     - Add to local state            │                    │
       │     - Re-render component           │                    │
       │     - Auto-scroll to message        │                    │
       │                                      │                    │
       │  5. User marks as read              │                    │
       │     emit('mark_as_read')            ├──────────────────►│
       │                                      │                    │
       │  6. Update database                 │                    │
       │     - Set isRead: true              │                    │
       │     - Update unreadCount            │                    │
       │                                      │                    │
       │  7. Broadcast read status           │                    │
       │     emit('message_read')            ├──────────────────►│
       │                                      │                    │
       └──────────────────────────────────────┘                    │
```

### REST Fallback Flow
```
┌──────────────┐                                            ┌──────────────┐
│   User A     │                                            │   User B     │
│  (Sender)    │                                            │  (Receiver)  │
└──────┬───────┘                                            └──────┬───────┘
       │                                                            │
       │ 1. Socket.io fails to connect                            │
       │    Fallback to REST API                                  │
       │                                                            │
       │ 2. POST /api/messages/{id}/send                          │
       │    with Authorization header                             │
       │    and message content                                   │
       │                                                            │
       ├─────────────► Express Server                             │
       │               - Validate JWT                             │
       │               - Save message to DB                       │
       │               - Return 201 Created                       │
       │                                                            │
       │ 3. Client handles response                               │
       │    - Add message locally                                 │
       │    - Update UI                                            │
       │                                                            │
       │ 4. User B's periodic polling                             │
       │    (if WebSocket unavailable)                            │
       │    GET /api/messages/{id}                                │
       │    Every 5 seconds                                       ├────────────►
       │                                                            │
       │                                                    Receives message
       │                                                    via polling
```

## 3. Conversation State Management

```
┌─────────────────────────────────────────────────────────────┐
│          MessagesPage Component State                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  conversations: [                                            │
│    {                                                          │
│      _id: ObjectId,                                          │
│      participants: [User1, User2],                          │
│      type: "direct" | "trip_inquiry",                       │
│      trip: {optional trip details},                         │
│      lastMessage: { content, sender, timestamp },            │
│      unreadCount: 3,                                         │
│    }                                                          │
│  ]                                                            │
│                                                              │
│  activeConversationId: "123abc..."                          │
│  showMobileChat: true|false                                 │
│  loading: true|false                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
           │                      │                    │
           ▼                      ▼                    ▼
    ┌────────────────┐   ┌──────────────┐    ┌──────────────┐
    │ConversationList │   │ ChatWindow   │    │ContextPanel │
    │                │   │              │    │              │
    │- Show list     │   │- Display msgs│    │- Show user   │
    │- Filter/search │   │- Send msg    │    │  info
    │- Select active │   │- Typing ind  │    │- Trip context
    │- Unread badges │   │- Read status │    │- View profile
    └────────────────┘   └──────────────┘    └──────────────┘
```

## 4. Data Models Diagram

```
┌────────────────────────────┐
│ User Model                  │
├────────────────────────────┤
│ _id: ObjectId              │
│ userId: String             │
│ email: String              │
│ fullName: String           │
│ role: "traveler"|"organizer"
│ profilePicture: String     │
│ bio: String                │
│ ...                         │
└──────────┬──────────────────┘
           │
           │ references
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────────────────────────┐   ┌────────────────────────────┐
│ Conversation Model              │   │ Message Model              │
├─────────────────────────────────┤   ├────────────────────────────┤
│ _id: ObjectId                   │   │ _id: ObjectId              │
│ participants: [UserId, UserId]  │   │ conversation: ConversationId
│ type: "direct"|"trip_inquiry"   │   │ sender: UserId             │
│ trip: TripId (optional)         │   │ content: String            │
│ lastMessage: {                  │   │ isRead: Boolean            │
│   content: String              │   │ readAt: Date               │
│   sender: UserId               │   │ attachments: [{type, url}] │
│   timestamp: Date              │   │ createdAt: Date            │
│ }                               │   │ updatedAt: Date            │
│ unreadCount: Map<UserId,Number> │   │ ...                        │
│ isActive: Boolean               │   │ ...                        │
│ createdAt: Date                │   │                            │
│ updatedAt: Date                │   └────────────────────────────┘
│ indexes:                        │
│   - participants               │
│   - lastMessage.timestamp      │
└─────────┬──────────────────────┘
          │
          │ references
          │
          ▼
    ┌────────────────────┐
    │ Trip Model         │
    ├────────────────────┤
    │ _id: ObjectId      │
    │ title: String      │
    │ destination: String│
    │ organizer: UserId  │
    │ ...                │
    └────────────────────┘
```

## 5. Trip Inquiry Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Traveler Views Trip Details                                  │
└──────────┬───────────────────────────────────────────────────┘
           │
           │ Sees "Ask Organizer" button with MessageCircle icon
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ Traveler Clicks "Ask Organizer"                              │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ Modal Opens:                                                 │
│ - Trip context shown (name, destination)                    │
│ - Text textarea for question/doubt                          │
│ - "Cancel" and "Send Message" buttons                       │
└──────────┬───────────────────────────────────────────────────┘
           │
           │ Traveler types doubt/question
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│ POST /api/messages/inquiry/start                            │
│ {                                                            │
│   tripId: "trip_id",                                         │
│   initialMessage: "Do you have vegetarian options?"         │
│ }                                                            │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼ (Backend Processing)
┌──────────────────────────────────────────────────────────────┐
│ 1. Verify trip exists                                        │
│ 2. Get trip organizer                                        │
│ 3. Check inquiry conversation doesn't exist                 │
│ 4. Create new conversation:                                 │
│    - participants: [traveler_id, organizer_id]              │
│    - type: "trip_inquiry"                                   │
│    - trip: trip_id                                          │
│ 5. Create initial message:                                  │
│    - conversation: new_conversation_id                      │
│    - sender: traveler_id                                    │
│    - content: "Do you have vegetarian options?"            │
│ 6. Return conversation with message                         │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼ (Frontend)
┌──────────────────────────────────────────────────────────────┐
│ Modal closes                                                 │
│ Navigate to Messages page                                    │
│ New conversation appears in list                            │
│ Organizer receives notification (future feature)            │
└──────────────────────────────────────────────────────────────┘
```

## 6. Socket.io Connection Lifecycle

```
App Start
   │
   ▼
useSocket Hook Initialized
   │
   ├─ Create Socket instance
   │  io('localhost:5000', {
   │    reconnectionDelay: 1000,
   │    reconnectionAttempts: 5,
   │    transports: ['websocket', 'polling']
   │  })
   │
   ▼
socket.on('connect')
   │
   ├─ socket.on('connect') ──► console: "Socket connected"
   │                        ──► setIsConnected(true)
   │
   ▼
User Navigates to Messages
   │
   ├─ MessagesPage mounts
   │  ├─ Fetch conversations from REST API
   │  ├─ Load Socket.io hooks
   │  ├─ Listen to real-time events
   │
   ▼
User Selects Conversation
   │
   ├─ socket.emit('join_conversation', id)
   │
   ▼
Messages Arrive in Real-Time
   │
   ├─ socket.on('message_received') ──► Update local state
   │
   ▼
User Leaves/Navigates Away
   │
   ├─ socket.emit('leave_conversation', id)
   │
   ▼
User Logs Out or App Unmounts
   │
   ├─ socket.disconnect()
   │  ├─ socket.on('disconnect')
   │  ├─ setIsConnected(false)
   │  ├─ Cleanup listeners
   │
   ▼
Connection Lost / Error
   │
   ├─ socket.on('error')
   │
   ├─ Automatic Reconnection (exponential backoff)
   │  ├─ 1 second delay
   │  ├─ 2 second delay
   │  ├─ 4 second delay
   │  ├─ 8 second delay
   │  ├─ 16 second delay
   │  ├─ Max 5 attempts
   │
   ├─ If reconnected: all is normal
   │  If max attempts reached: use REST API fallback
```

## 7. Access Control Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                  USER TYPES & PERMISSIONS                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TRAVELER → TRAVELER                                        │
│  ├─ Requires: Mutual following                             │
│  ├─ Type: "direct"                                         │
│  ├─ Access: Both can send/receive                          │
│  └─ Use case: Trip coordination, tips                      │
│                                                              │
│  TRAVELER → ORGANIZER                                       │
│  ├─ Option 1: Through following (if they follow)           │
│  │  ├─ Type: "direct"                                      │
│  │  ├─ Normal message exchange                             │
│  │                                                          │
│  ├─ Option 2: Via trip inquiry (NO following needed) ◄─── │
│  │  ├─ Type: "trip_inquiry"                                │
│  │  ├─ Button: "Ask Organizer" on trip detail              │
│  │  ├─ Access: Traveler sends, Organizer receives         │
│  │  └─ Use case: Questions before booking                  │
│  │                                                          │
│  ORGANIZER → TRAVELER                                       │
│  ├─ Through mutual following                               │
│  ├─ Can reply to trip inquiries                            │
│  └─ Type: "direct" or reply in "trip_inquiry"            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 8. Message Status Timeline

```
User A sends message
      │
      ▼
   CREATED
   ├─ Timestamp recorded
   ├─ Stored in database
   ├─ Broadcasting to room
      │
      ▼
   DELIVERED to User B
   ├─ Message appears in chat
   ├─ Badge shows unread count
   ├─ Notification (future)
      │
      ▼
   READ
   ├─ User B views message
   ├─ isRead: true
   ├─ readAt: timestamp
   ├─ Checkmark appears for User A
   ├─ Unread count decreases
      │
      ▼
   ACKNOWLEDGED
   ├─ Both users see read status
   ├─ Confirmation complete
```

---

These diagrams illustrate the complete architecture, data flow, and interactions within the TripMate messaging system.
