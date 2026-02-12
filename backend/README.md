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
├── routes/           # API routes
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

## 🤝 Contributing

This is a feature-by-feature development. Each feature is:
1. Fully implemented
2. Tested
3. Documented
4. Then we move to the next feature
