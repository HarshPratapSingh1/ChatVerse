# 💬 ChatVerse - Real-time Chat App

Welcome to **ChatVerse** – a modern, responsive, and secure real-time chat application built using the **MERN stack** and **TailwindCSS**. Chat one-on-one with your friends with smooth UI and instant updates!

![Chat App Screenshot]([https://your-image-link-if-any.com](https://private-user-images.githubusercontent.com/133925969/462695741-99c7c312-8cd7-440a-8b12-05b985d421c7.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTE2ODAyMjcsIm5iZiI6MTc1MTY3OTkyNywicGF0aCI6Ii8xMzM5MjU5NjkvNDYyNjk1NzQxLTk5YzdjMzEyLThjZDctNDQwYS04YjEyLTA1Yjk4NWQ0MjFjNy5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNzA1JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDcwNVQwMTQ1MjdaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01Y2UyY2UzOTY3ZTE5MGIzMmY0NTk4MzgxZDI1OWRkOWY1NGY3OTc3NDVhOThiM2M3OGIzZGRmNTU2YTg3ZGU5JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.amWtiajKIP-96yCyEWHR7fTDpPVa9xmmTDba7RGz0V0))

---

## 🚀 Tech Stack

| Frontend | Backend | Database | Authentication | Styling |
|----------|---------|----------|----------------|---------|
| [React.js](https://reactjs.org/) | [Express.js](https://expressjs.com/) | [MongoDB](https://www.mongodb.com/) | [JWT](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | [TailwindCSS](https://tailwindcss.com/) |

---

## ✨ Features

- 🔐 **JWT Authentication** with secure password hashing using bcrypt
- 💬 **Real-time messaging**
- 🧾 **Clean and modern UI** powered by TailwindCSS
- 🪪 **User registration and login**
- 📜 **Chat history and message persistence**
- 🎯 **Responsive design** for mobile and desktop
- 🧑‍🤝‍🧑 **User list sidebar** with active status
- 🧼 **Auto-scroll to latest message**
- ✅ **Logout / Session management**

---

## 📸 Preview

| Login Page | Chat Interface |
|------------|----------------|
| ![Login](https://your-login-preview-link.com) | ![Chat](https://your-chat-preview-link.com) |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js
- MongoDB
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/chatverse.git

# Backend setup
cd chatverse/backend
npm install

# Frontend setup
cd ../frontend
npm install

PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Run backend
cd backend
npm start

# Run frontend
cd frontend
npm start

