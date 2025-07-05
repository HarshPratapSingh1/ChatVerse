const express = require('express');
const dot = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bycrypt = require("bcryptjs");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

dot.config();

const User = require('./db/User');
const Message = require('./db/Message');

const JWTSECRET = process.env.jwtSecret;
mongoose.connect(process.env.mongoUrl);
const bycryptSalt = bycrypt.genSaltSync(10);

const app = express();

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cookieParser());

// ✅ CORS for local dev + Netlify
app.use(cors({
  origin: ['http://localhost:5173', 'https://chatversse.netlify.app'],
  credentials: true
}));

// 🔐 Utility function to extract user from JWT
async function getUserData(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, JWTSECRET, {}, (err, userData) => {
        if (err) return reject(err);
        resolve(userData);
      });
    } else {
      reject('No token');
    }
  });
}

// ✅ Routes
app.get('/test', (req, res) => {
  res.json({ message: "tested" });
});

app.get('/profile', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, JWTSECRET, {}, (err, userData) => {
      if (err) return res.status(401).json({ msg: "Token invalid" });
      res.json(userData);
    });
  } else {
    res.status(401).json({ msg: "No token" });
  }
});

app.get('/messages/:userId', async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserData(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] }
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get('/people', async (req, res) => {
  const users = await User.find({}, { '_id': 1, username: 1 });
  res.json(users);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const isPresent = await User.findOne({ username });
  if (!isPresent) return res.status(400).json({ msg: "User not exist" });

  const isOk = bycrypt.compareSync(password, isPresent.password);
  if (!isOk) return res.status(400).json({ msg: "Wrong Password !!!" });

  jwt.sign({ userId: isPresent._id, username }, JWTSECRET, {}, (err, token) => {
    if (err) throw err;
    res
      .cookie('token', token, { sameSite: "none", secure: true })
      .status(201)
      .json({ _id: isPresent._id });
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPass = bycrypt.hashSync(password, bycryptSalt);
    const createdUser = await User.create({ username, password: hashedPass });

    jwt.sign({ userId: createdUser._id, username }, JWTSECRET, {}, (err, token) => {
      if (err) throw err;
      res
        .cookie('token', token, { sameSite: "none", secure: true })
        .status(201)
        .json({ _id: createdUser._id });
    });
  } catch (err) {
    res.status(500).json({ msg: "Error Found" });
  }
});

app.post('/logout', async (req, res) => {
  res.cookie('token', '', { sameSite: "none", secure: true }).status(201).json('ok');
});

const server = app.listen(3000);

// ✅ WebSocket setup
const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
  function notifyAboutOnlinePeople() {
    [...wss.clients].forEach(e => {
      e.send(JSON.stringify({
        online: [...wss.clients].map(ev => ({ userId: ev.userId, username: ev.username }))
      }));
    });
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(st => st.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, JWTSECRET, {}, (err, userData) => {
          if (!err) {
            const { userId, username } = userData;
            connection.userId = userId;
            connection.username = username;
          }
        });
      }
    }
  }

  connection.on('message', async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text, file } = messageData;
    let filename = null;

    if (file) {
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + "." + ext;
      const filePath = path.join(__dirname, 'uploads', filename);
      const bufferData = Buffer.from(file.data.split(',')[1], 'base64');
      fs.writeFile(filePath, bufferData, () => {
        console.log("file saved: " + filePath);
      });
    }

    if (recipient && (text || file)) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
        file: filename
      });

      [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
          text,
          sender: connection.userId,
          recipient,
          file: file ? filename : null,
          _id: messageDoc._id
        })));
    }
  });

  notifyAboutOnlinePeople();
});
