A privacy-focused social travel platform that combines trip discovery, organizer-based travel planning, booking, maps integration, and rule-based personalized recommendations.

📌 Project Overview

Trip Mate is a full-stack travel web application where:

Travelers can explore, book, and share travel experiences.

Organizers can create and manage structured travel plans.

Users receive personalized trip recommendations using a rule-based system.

Trips are visualized on interactive maps using Leaflet and OpenStreetMap.

The platform integrates social networking, trip planning, and intelligent discovery into one unified system.

🚀 Features
👤 Authentication

Role-based signup (Traveler / Organizer)

Unique userId login

JWT-based authentication

🧳 Traveler Features

Browse and filter trips

View trip details

Book trips (UPI-based flow)

See personalized recommendations

Create travel posts

Like and comment on posts

Follow other users

View trip locations on interactive map

Message organizers and other users

🏢 Organizer Features

Create and manage trip plans

Add detailed itinerary

Set budget, duration, start date

Add trip location coordinates

View bookings

Respond to user messages

🗺 Maps Integration

Built using Leaflet + OpenStreetMap

Displays trip markers by category

Filter-based map rendering

No paid API required

🎯 Rule-Based Recommendation System

Trip Mate uses a deterministic rule-based scoring system (not AI).

It recommends trips based on:

Previously booked categories

Budget preferences

Duration preferences

Liked trips

Destination matching

Each trip is scored using weighted conditions and sorted to return top recommendations.

No machine learning is used.

🏗 Tech Stack
Frontend

React (Vite)

TypeScript

Tailwind CSS

Leaflet (Maps)

Backend

Node.js

Express.js

MongoDB (Mongoose)

Database

MongoDB (Local or Atlas)

📊 System Architecture
Frontend (React)
        ↓ API Calls
Backend (Node.js + Express)
        ↓
MongoDB Database

Maps:
Leaflet → OpenStreetMap Tiles


Recommendation Engine runs in backend as rule-based scoring logic.

🗂 Database Entities

User

OrganizerProfile

Trip

Booking

Post

Like

Comment

Message

Follow

⚙ Installation
1️⃣ Clone the Repository
git clone <repo-url>
cd tripmate

2️⃣ Install Frontend
npm install
npm run dev

3️⃣ Install Backend
cd backend
npm install
npm start

4️⃣ Run MongoDB (Local)
mongod


Database runs at:

mongodb://localhost:27017/tripmate

📈 Future Improvements

Payment gateway integration (Razorpay / Stripe)

Real-time chat (Socket.io)

Trip rating system

Advanced recommendation engine

Trip analytics dashboard

Cloud image storage

🎓 Academic Relevance

This project demonstrates:

Full-stack development

Role-based access control

Database design & ER modeling

Rule-based recommendation logic

REST API design

Map integration

Social media features implementation

🏁 Conclusion

Trip Mate is a structured, scalable, and explainable travel platform that merges:

Social interaction

Verified trip planning

Personalized discovery

Interactive maps

Booking management

All without relying on AI models or paid APIs.
  
