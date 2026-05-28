// server.js
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const http = require("http"); // Node ka in-built HTTP module
const socketIo = require("socket.io"); // Socket.io

const PORT = process.env.PORT || 4000;

// Connect to the database
connectDB();

// 🌟 STEP 1: Express app ko HTTP server mein wrap karo
const server = http.createServer(app);

// 🌟 STEP 2: Socket.io ko HTTP server ke sath initialize karo
const io = socketIo(server, {
  pingTimeout: 60000,
  pingInterval: 25000,
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
      ].filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🌟 STEP 3: Socket Room & Connection Logic
io.on("connection", (socket) => {
  console.log("🔌 New Client Connected:", socket.id);

  // Jab frontend bolega: "Mujhe is deployment ke logs dekhne hain"
  socket.on("join:deployment", (deploymentId) => {
    const roomName = `dep:${deploymentId}`;
    socket.join(roomName);
    console.log(`👤 Client ${socket.id} joined room: ${roomName}`);
  });

  // Jab frontend page chhod dega
  socket.on("leave:deployment", (deploymentId) => {
    const roomName = `dep:${deploymentId}`;
    socket.leave(roomName);
    console.log(`👤 Client ${socket.id} left room: ${roomName}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`[❌ Disconnect] User: ${socket.id} | Exact Reason: "${reason}"`);
    
    if (reason === "client namespace disconnect") {
      console.log("ℹ️ Frontend ne khud disconnect kiya (Probably React useEffect cleanup or manual close).");
    } else if (reason === "transport close") {
      console.log("ℹ️ User ne tab close kar diya ya network connectivity issue hai.");
    } else if (reason === "ping timeout") {
      console.log("⚠️ Internet slow hai ya heartbeat fail ho gayi (Connection timeout).");
    }
  });
});

// 🌟 STEP 4: Deployment Engine (Controller) tak 'io' pahunchane ka tareeqa
app.set("io", io);

// 🌟 STEP 5: Start the server (app.listen ki jagah server.listen aayega)
server.listen(PORT, () => {
  console.log(`Server & WebSockets running perfectly on port ${PORT}`);
});
