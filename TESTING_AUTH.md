# 🧪 Testing Your Auth Integration

## ✅ What's Now Connected

Your frontend is now fully connected to the backend! Here's what works:

### 1. User Registration ✅
- Real-time userId availability check (backend API)
- Creates user in MongoDB database
- Stores JWT token and user data in localStorage
- Displays actual user data on profile

### 2. User Login ✅
- Validates credentials against database
- Returns JWT token
- Stores user session
- Shows real user info

### 3. Profile Display ✅
- Loads actual user data from localStorage
- Shows real userId and fullName from signup
- Falls back to mock data for fields not yet filled

### 4. Profile Update ✅
- Updates profile in database
- Saves changes to backend
- Refreshes display with new data

---

## 🎯 Step-by-Step Testing

### Step 1: Make Sure Both Servers Are Running

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```
Frontend should be on: http://localhost:5173

---

### Step 2: Test Registration Flow

1. **Go to your frontend**: http://localhost:5173
2. **Click "Get Started" or navigate to Auth page**
3. **Switch to "Sign up" tab**
4. **Fill in the form:**
   - User ID: `john_doe_2026` (try different values - it checks backend!)
   - Full Name: `John Doe`
   - Email: `john.doe@example.com`
   - Password: `password123`
   - Role: Choose `Traveler` or `Organizer`
   - Organization Name: (if organizer) `John's Adventures`

5. **Watch the magic:**
   - ✅ As you type userId, it checks backend availability in real-time
   - ✅ Green checkmark = available
   - ✅ Red X = already taken

6. **Click "Create account"**
   - ✅ User is created in MongoDB
   - ✅ JWT token is stored
   - ✅ User data is stored in localStorage

---

### Step 3: Verify Profile Display

1. **Navigate to Profile page**
2. **You should see:**
   - ✅ Your actual userId: `john_doe_2026`
   - ✅ Your actual full name: `John Doe`
   - ✅ Your role: `Traveler` or `Organizer`

---

### Step 4: Test Profile Update

1. **Click "Edit Profile" button**
2. **Update fields:**
   - Full Name: `John Doe Updated`
   - Bio: `Passionate traveler exploring the world`
   - Location: `New York, USA` (if available)

3. **Click "Save Changes"**
   - ✅ Updates backend database
   - ✅ Updates localStorage
   - ✅ Page refreshes with new data

---

### Step 5: Test Login Flow

1. **Logout** (or open incognito window)
2. **Go to Login page**
3. **Enter credentials:**
   - User ID: `john_doe_2026`
   - Password: `password123`

4. **Click "Log in"**
   - ✅ Validates against database
   - ✅ Returns JWT token
   - ✅ Stores session
   - ✅ Profile shows your data

---

## 🔍 Debug & Verify

### Check Browser Console

Open DevTools (F12) and check Console:
- Look for successful API responses
- Check for any error messages

### Check localStorage

In DevTools Console, run:
```javascript
// View stored user
console.log(JSON.parse(localStorage.getItem('user')));

// View stored token
console.log(localStorage.getItem('token'));
```

You should see:
```javascript
{
  _id: "...",
  userId: "john_doe_2026",
  email: "john.doe@example.com",
  fullName: "John Doe",
  role: "traveler",
  bio: "...",
  stats: { ... },
  createdAt: "...",
  updatedAt: "..."
}
```

### Check Network Tab

1. Open DevTools → Network tab
2. Perform registration/login
3. Look for requests to `http://localhost:5000/api/auth/...`
4. Check response status (should be 200 or 201)
5. View response data

---

## 🎨 What You'll See

### Before (Mock Data):
- Generic names like "Alex Rodriguez"
- Fake userId like "alex_wanderlust"
- Demo data

### After (Real Data):
- ✅ YOUR actual userId from signup
- ✅ YOUR actual full name
- ✅ YOUR actual role (Traveler/Organizer)
- ✅ YOUR actual bio (when updated)
- ✅ Data persisted in MongoDB

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network error"
**Cause:** Backend server not running
**Solution:**
```powershell
cd backend
npm run dev
```

### Issue 2: "MongoDB Connection Error"
**Cause:** MongoDB not running
**Solution:**
- **Windows:** Start MongoDB service
- **Or use MongoDB Atlas** (cloud - recommended)
  - Update `MONGODB_URI` in `backend/.env`

### Issue 3: userId shows as "available" but registration fails
**Cause:** Backend API not responding
**Solution:**
- Check backend console for errors
- Verify MongoDB is connected
- Check `backend/.env` configuration

### Issue 4: Profile shows mock data instead of real data
**Cause:** localStorage not set or cleared
**Solution:**
1. Check browser console for errors
2. Verify token exists: `localStorage.getItem('token')`
3. Try logout and login again
4. Clear browser cache and try again

### Issue 5: "Invalid token" or "Not authorized"
**Cause:** Token expired or invalid
**Solution:**
1. Logout
2. Login again
3. Token is automatically refreshed

---

## 📊 Data Flow Diagram

```
SIGNUP FLOW:
User fills form → Frontend validates → Backend API /auth/register
    ↓
Backend creates user in MongoDB
    ↓
Backend returns { token, user }
    ↓
Frontend stores in localStorage
    ↓
Frontend displays user data in profile

LOGIN FLOW:
User enters credentials → Backend API /auth/login
    ↓
Backend validates against MongoDB
    ↓
Backend returns { token, user }
    ↓
Frontend stores in localStorage
    ↓
User is logged in

PROFILE DISPLAY:
Page loads → Check localStorage for user data
    ↓
If exists: Display real data
    ↓
If not: Show mock data (demo mode)

PROFILE UPDATE:
User edits profile → Backend API /auth/profile (with JWT token)
    ↓
Backend updates MongoDB
    ↓
Backend returns updated user
    ↓
Frontend updates localStorage
    ↓
Page refreshes with new data
```

---

## ✅ Success Checklist

Test these one by one:

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend loads at http://localhost:5173
- [ ] Can type in signup form
- [ ] userId availability check works (green/red indicator)
- [ ] Registration creates user successfully
- [ ] Browser console shows "Registration successful"
- [ ] localStorage has token and user data
- [ ] Profile page shows MY actual userId
- [ ] Profile page shows MY actual full name
- [ ] Can edit and update profile
- [ ] Changes persist after page refresh
- [ ] Can logout and login again
- [ ] Login shows same user data

---

## 🚀 Next Steps

Once this is working, we can:
1. Add trip creation (organizers)
2. Add trip browsing (all users)
3. Add booking functionality (travelers)
4. Add messaging between users
5. Add file upload for profile pictures
6. Add more profile fields

**Everything is working? Let me know and we'll build Feature #2: Trip Management!** 🎉
