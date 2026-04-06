# TripMate Backend API

Backend server for TripMate - A social travel planning platform.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- Other environment variables

5. Start MongoDB (if using local):
```bash
mongod
```

6. Run the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Feature #1: Authentication & User Management ✅

#### Public Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "userId": "john_traveler",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "traveler" | "organizer",
  "organizationName": "Travel Co" // Required if role is organizer
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "userId": "john_traveler",
  "password": "password123"
}
```

**Google Login / Signup**
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "<google_id_token>",
  "mode": "login" | "signup",
  "role": "traveler" | "organizer", // Required for signup when creating a new account
  "organizationName": "Travel Co", // Required if role is organizer
  "userId": "preferred_user_id" // Optional for signup
}
```

**Check User ID Availability**
```http
GET /api/auth/check-userid/:userId
```

#### Protected Endpoints (Require Authentication)

Add this header to all protected requests:
```http
Authorization: Bearer <your_jwt_token>
```

**Get Current User Profile**
```http
GET /api/auth/me
```

**Update Profile**
```http
PUT /api/auth/profile
Content-Type: application/json

{
  "fullName": "John Updated",
  "bio": "Travel enthusiast",
  "location": "New York, USA",
  "organizationDescription": "Best travel company" // For organizers
}
```

**Change Password**
```http
PUT /api/auth/change-password
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

### 🔜 Coming Next Features:

#### Feature #2: Trip Management (Next)
- Create, update, delete trips (organizers)
- Browse and search trips
- View trip details
- Book trips (travelers)

#### Feature #3: Messages & Chat
- Send and receive messages
- Conversation management
- Real-time messaging (Socket.io)

#### Feature #4: User Profiles & Social
- View user profiles
- Follow/unfollow users
- Post creation (travelers)
- Reviews and ratings

#### Feature #5: Additional Features
- File uploads (trip images)
- Notifications
- Search and filters
- Analytics dashboard

## 🗄️ Database Models

### User Model
```javascript
{
  userId: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: 'traveler' | 'organizer',
  bio: String,
  profilePicture: String,
  location: String,
  organizationName: String (organizers only),
  organizationLocation: String,
  organizationDescription: String,
  verified: Boolean,
  stats: {
    tripsCreated: Number,
    tripsJoined: Number,
    countriesVisited: Number,
    reviews: Number,
    rating: Number
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- CORS protection

## 📝 Project Structure

```
backend/
├── controllers/       # Request handlers
├── models/           # Database models
├── rag/              # Python RAG pipeline (embeddings + FAISS retrieval)
├── routes/           # API routes
├── services/         # Service layer (includes RAG orchestrator services)
├── middleware/       # Custom middleware
├── utils/            # Helper functions
├── .env.example      # Environment variables template
├── .gitignore
├── package.json
└── server.js         # Entry point
```

## 🧪 Testing

Test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Your frontend application

## 📌 Notes

- Make sure MongoDB is running before starting the server
- Keep your `.env` file secure and never commit it
- Use strong JWT_SECRET in production
- Enable HTTPS in production

## Chatbot RAG Setup

The chatbot now supports a Retrieval Augmented Generation (RAG) flow using:

- Embeddings: `all-MiniLM-L6-v2`
- Vector DB: `FAISS`
- LLM: `Groq Chat Completions API`

### 1) Install Python dependencies

```bash
cd backend
pip install -r rag/requirements.txt
```

If you have multiple Python installations, set `RAG_PYTHON_COMMAND` in `.env` to the interpreter where these packages are installed (for example: `py -3` or `"C:/Program Files/Python312/python.exe"`).

### 2) Configure Groq API

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

Add these values to `backend/.env`.

### 3) Build FAISS index from TripMate trips

```bash
cd backend
npm run rag:build-index
```

This script reads trip data from MongoDB and creates index files under `backend/rag/index/`.

### 4) Chatbot API endpoint

`POST /api/chatbot/query`

Request body:

```json
{
  "message": "Plan a 3 day trip to Ooty",
  "history": [
    { "role": "user", "content": "Suggest budget trip options" }
  ],
  "userRole": "traveler"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reply": "...",
    "retrievedCount": 5,
    "sources": []
  }
}
```

## 🤝 Contributing

This is a feature-by-feature development. Each feature is:
1. Fully implemented
2. Tested
3. Documented
4. Then we move to the next feature
