# 🚀 TripMate Backend - Getting Started Guide

## ✅ Feature #1: Authentication & User Management (COMPLETED)

Your backend is now set up with the first complete feature!

### 📁 What We've Built

```
backend/
├── controllers/
│   └── auth.controller.js      # Authentication logic
├── middleware/
│   └── auth.middleware.js      # JWT & protection
├── models/
│   └── User.model.js           # User database schema
├── routes/
│   └── auth.routes.js          # API endpoints
├── .env                        # Your configuration
├── .env.example                # Template for others
├── package.json                # Dependencies
├── README.md                   # API documentation
├── server.js                   # Main server file
└── test-api.js                 # Test script

```

---

## 🎯 Quick Start

### 1. Install MongoDB

**Option A: MongoDB Community (Local)**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Go to: https://www.mongodb.com/cloud/atlas
- Create free account
- Create cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

### 2. Start Backend Server

```powershell
# Navigate to backend folder
cd backend

# Start the server
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
📍 Environment: development
🌐 API URL: http://localhost:5000/api
```

### 3. Test the API

**Option A: Use the test script**
```powershell
# In backend folder
node test-api.js
```

**Option B: Use your frontend**
- Your frontend is already running on http://localhost:5173
- Now it can connect to backend API!

**Option C: Use Postman/Thunder Client**
- Import the endpoints from README.md

---

## 🔌 Connecting Frontend to Backend

### Update your frontend to use the API:

**Example: Update Login Handler**

In `src/app/components/auth/LoginForm.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Save token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect or show success
      toast.success('Login successful!');
      // Navigate to home or dashboard
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
  }
};
```

**Example: Update Registration Handler**

In `src/app/components/auth/SignupForm.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (userIdValidation !== "available") return;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fullName,
        email,
        password,
        role,
        ...(role === 'organizer' && { organizationName })
      }),
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // Save token and user
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      toast.success('Account created successfully!');
      onSignupComplete();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
  }
};
```

---

## 🧪 API Endpoints Summary

### Public (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/check-userid/:userId` | Check if userId is available |

### Protected (Requires Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |

---

## 🔐 Authentication Flow

1. **User registers or logs in**
   - Backend returns JWT token
   
2. **Frontend stores token**
   ```javascript
   localStorage.setItem('token', data.data.token);
   ```

3. **Frontend sends token with requests**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

4. **Backend validates token**
   - Returns user data or error

---

## 📊 User Data Structure

```javascript
{
  _id: "507f1f77bcf86cd799439011",
  userId: "sarah_explorer",
  email: "sarah@example.com",
  fullName: "Sarah Chen",
  role: "traveler", // or "organizer"
  bio: "Digital nomad exploring Asia...",
  profilePicture: "",
  location: "Tokyo, Japan",
  
  // Organizer specific fields
  organizationName: "Nomad Adventures",
  organizationLocation: "Global",
  organizationDescription: "...",
  verified: false,
  
  // Statistics
  stats: {
    tripsCreated: 0,
    tripsJoined: 0,
    countriesVisited: 0,
    reviews: 0,
    rating: 0
  },
  
  isActive: true,
  lastLogin: "2026-02-11T...",
  createdAt: "2026-02-11T...",
  updatedAt: "2026-02-11T..."
}
```

---

## 🔜 Next Steps

### Feature #2: Trip Management (Ready to Build)

We'll implement:
- ✅ Create trip (organizers only)
- ✅ Update/Delete trips
- ✅ Browse all trips
- ✅ Search & filter trips
- ✅ View trip details
- ✅ Book trips (travelers)
- ✅ Trip itinerary management

**Just let me know when you're ready, and I'll build Feature #2!**

---

## 🎓 Common Issues & Solutions

### Issue: "MongoDB Connection Error"
**Solution:** Make sure MongoDB is running
```powershell
# If using local MongoDB
mongod

# Or check if service is running
Get-Service -Name MongoDB
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in `.env`
```
PORT=5001
```

### Issue: "CORS Error in frontend"
**Solution:** Make sure `FRONTEND_URL` in `.env` matches your frontend URL

### Issue: "Module not found"
**Solution:** Reinstall dependencies
```powershell
cd backend
rm -rf node_modules
npm install
```

---

## 📝 Testing Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Health check endpoint works: `http://localhost:5000/api/health`
- [ ] Can register a traveler
- [ ] Can register an organizer
- [ ] Can login
- [ ] Can get user profile
- [ ] Can update profile
- [ ] Token authentication works

---

## 🛠️ Development Tips

1. **Keep both servers running:**
   - Frontend: `npm run dev` (port 5173)
   - Backend: `npm run dev` (port 5000)

2. **Use environment variables:**
   - Never commit `.env` file
   - Use `.env.example` as template

3. **Test frequently:**
   - Test each endpoint after changes
   - Use Postman collections

4. **Monitor logs:**
   - Backend logs show request details
   - Check for errors in console

---

## 📞 Need Help?

If something isn't working:
1. Check the error message in terminal
2. Verify MongoDB connection
3. Check if ports are available
4. Review the README.md for examples

**Ready for Feature #2?** Just say "Let's build the trip management feature" and I'll start implementing it! 🚀
