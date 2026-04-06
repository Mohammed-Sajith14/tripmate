# Messaging System - Component Architecture

## Component Structure

```
MessagesPage (Main Container)
├── Socket Hook Integration
├── Conversation State Management
├── Loading & Data Fetching
└── Layout Switching (Desktop/Mobile)
    ├── Desktop (3-Panel Layout)
    │   ├── ConversationList (Left Panel)
    │   ├── ChatWindow (Center Panel)
    │   └── ContextPanel (Right Panel - organizer/traveler info)
    │
    └── Mobile (2-Panel Flow)
        ├── ConversationList (Full Width)
        ├── ChatWindow (Full Width with back button)
        └── ContextPanel (Overlay)
```

## Component Details

### MessagesPage.tsx
**Purpose**: Main messaging interface container

**Props**:
```typescript
interface MessagesPageProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (page: string) => void;
}
```

**State**:
- `conversations` - Array of conversation objects
- `activeConversationId` - Currently selected conversation
- `showMobileChat` - Show/hide chat view on mobile
- `showMobileContext` - Show/hide context panel on mobile
- `loading` - Data loading state

**Key Features**:
- Fetches conversations from `/api/messages`
- Real-time Socket.io event listeners
- Responsive desktop/mobile layout
- Conversation filtering and search

**Socket Events**:
- Listens: `message_received`, `message_read`
- Emits: `join_conversation`

---

### ChatWindow.tsx
**Purpose**: Individual conversation chat interface

**Props**:
```typescript
interface ChatWindowProps {
  conversation: {
    id?: string;
    _id?: string;
    name?: string;
    userId?: string;
    role?: "traveler" | "organizer";
    messages?: Message[];
    tripContext?: {
      tripName: string;
      destination: string;
    } | null;
    otherParticipant?: any;
  } | null;
  onBack: () => void;
  onShowInfo: () => void;
  onViewTrip?: () => void;
}
```

**State**:
- `messages` - Array of message objects
- `messageInput` - Current message being typed
- `isTyping` - Show typing indicator
- `isSending` - Sending state for button

**Key Features**:
- Real-time message display
- Send messages via Socket.io
- Fallback to REST API
- Auto-scroll to latest message
- Sender/receiver message styling
- Trip context display
- User role badges (Organizer/Traveler)

**Socket Events**:
- Listens: `message_received`, `message_read`
- Emits: `send_message`, `join_conversation`

---

### ConversationList.tsx
**Purpose**: Display user's conversations with filtering

**Props**:
```typescript
interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}
```

**State**:
- `searchQuery` - Search filter text
- `activeFilter` - Filter by role (all/organizers/travelers)

**Key Features**:
- Search conversations by name/userId/message
- Filter by conversation partner type
- Last message preview
- Unread count badges
- Active conversation highlighting
- Timestamp display

**Data Mapping**:
```typescript
- Handles both mock and real data
- Maps _id ↔ id properties
- Maps otherParticipant info
- Formats timestamps
```

---

### ConversationItem.tsx
**Purpose**: Individual conversation list item

**Props**:
```typescript
interface ConversationItemProps {
  id: string;
  name: string;
  userId: string;
  role: "traveler" | "organizer";
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick: () => void;
}
```

**Display**:
- User avatar with initials
- User name and role badge
- Last message preview (truncated)
- Time since last message
- Unread count badge (red)
- Active state styling

---

### ContextPanel.tsx
**Purpose**: Display selected conversation partner's information

**Props**:
```typescript
interface ContextPanelProps {
  type: "traveler" | "organizer";
  data: {
    userId: string;
    name: string;
    role: string;
    location?: string;
    bio?: string;
    organizationName?: string;
    organizationDescription?: string;
  };
  tripContext?: {
    tripName: string;
    destination: string;
    image: string;
  } | null;
  onViewProfile?: () => void;
  onViewTrip?: () => void;
}
```

**Display Content**:
- **For Travelers**: Name, bio, location, profile info
- **For Organizers**: Organization name, description, location
- **Trip Context**: Trip details with quick view button

---

### MessageBubble.tsx
**Purpose**: Individual message display component

**Props**:
```typescript
interface MessageBubbleProps {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  sender?: {
    fullName: string;
    profilePicture?: string;
  };
}
```

**Styling**:
- Sent messages: Teal background, right-aligned
- Received messages: Slate background, left-aligned
- Read status indicator (checkmark)
- Timestamp display
- Sender name display (for received messages)

---

## Data Flow

### Message Sending Flow
```
User types message in ChatWindow
↓
User hits Enter or clicks Send button
↓
Socket.io sends to server (if connected)
OR REST API fallback (POST /api/messages/{id}/send)
↓
Server saves to MongoDB
↓
Server broadcasts to conversation room via Socket.io
↓
All participants receive message_received event
↓
Message displayed in ChatWindow in real-time
```

### Real-Time Update Flow
```
Message sent from User A
↓
Socket.io server receives send_message event
↓
Server saves to database
↓
Server broadcasts message_received event to conversation room
↓
User B's ChatWindow receives the event
↓
Message added to local state
↓
Component re-renders with new message
↓
Auto-scroll to bottom occurs
```

### Conversation Loading Flow
```
MessagesPage mounts
↓
useEffect fetches /api/messages
↓
Conversations loaded into state
↓
Socket.io connects (useSocket hook)
↓
User selects conversation
↓
Messages component joins Socket.io room
↓
ChatWindow displays messages
↓
Real-time events now active for this conversation
```

## Mobile Responsive Behavior

**Desktop (lg breakpoint)**:
- Three-column layout always visible
- ConversationList on left (fixed width)
- ChatWindow in center (flexible)
- ContextPanel on right (fixed width)

**Tablet/Mobile (below lg)**:
- Two-state flow
- Initially shows ConversationList
- Click conversation → show ChatWindow with back button
- InfoIcon → overlay ContextPanel
- Clicking close/outside overlay returns to ChatWindow

## Message Structure

```typescript
interface Message {
  id: string;                    // MongoDB ObjectId or timestamp
  content: string;               // Message text
  timestamp: string;             // Formatted time for display
  isSent: boolean;               // Sent by current user?
  isRead?: boolean;              // Read by recipient?
  sender?: {                     // Sender info
    _id: string;
    fullName: string;
    userId: string;
    profilePicture?: string;
    role: "traveler" | "organizer";
  };
}
```

## Conversation Structure

```typescript
interface Conversation {
  _id?: string;                 // MongoDB ObjectId
  id?: string;                  // Alternative id property
  participants: User[];          // Array of user objects
  otherParticipant?: User;      // Computed - the other user
  type: "direct" | "trip_inquiry"; // Conversation type
  trip?: {                       // Trip context (if inquiry)
    _id: string;
    title: string;
    destination: string;
    coverImage: string;
  };
  lastMessage?: {
    content: string;
    sender: User;
    timestamp: Date;
  };
  messages?: Message[];          // Messages in conversation
  unreadCount?: number;          // Unread count for current user
}
```

## Error Handling

**Network Errors**:
- Socket.io auto-reconnects with exponential backoff
- REST API errors logged to console
- User sees error toast (if toast system integrated)

**Authorization Errors**:
- 403 returned if user not conversation participant
- Conversation won't load
- Error message displayed to user

**Validation Errors**:
- Empty messages not sent
- Required fields validated
- User gets visual feedback (disabled button, etc.)

## Performance Optimizations

1. **Message Pagination**: Large conversations paginated
2. **Lazy Loading**: Conversations loaded on demand
3. **Socket.io Rooms**: Users only receive messages for joined rooms
4. **Unread Cache**: Counts stored in conversation document
5. **Message Indexing**: Database indexes on frequently queried fields
6. **Optimistic Updates**: UI updates before server confirmation

## Testing Considerations

**Unit Testing**:
- Message formatting logic
- Conversation filtering logic
- Timestamp formatting

**Integration Testing**:
- Socket.io connection/disconnection
- Message send/receive flow
- Conversation switching
- Real-time updates across multiple clients

**E2E Testing**:
- Full user journey from message to read receipt
- Mobile/tablet responsiveness
- Cross-browser Socket.io compatibility
