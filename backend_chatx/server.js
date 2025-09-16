import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient, ServerApiVersion } from "mongodb";
import { createMessageRoutes } from "./routes/messageRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupSocketHandlers } from "./utils/socketHandler.js";
import { CleanupService } from "./services/cleanupService.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = process.env.ATLAS_URI;
let db;
let cleanupService;

const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: "majority",
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB Atlas
async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Set the database (you can change 'chatx' to your preferred database name)
    db = client.db("chatx");

    // Setup routes after database connection is established
    app.use("/api/messages", createMessageRoutes(db));

    // Setup Socket.IO handlers
    setupSocketHandlers(io, db);

    // Initialize and start cleanup service
    cleanupService = new CleanupService(db);
    cleanupService.startScheduledCleanup(60); // Run cleanup every 60 minutes

    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    process.exit(1);
  }
}

// Basic route to test server
app.get("/", (req, res) => {
  res.json({
    message: "ChatX Backend Server is running!",
    database: db ? "Connected to MongoDB Atlas" : "Database not connected",
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await client.db("admin").command({ ping: 1 });
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server and connect to database
async function startServer() {
  await connectToDatabase();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO server ready`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");

  // Stop cleanup service
  if (cleanupService) {
    cleanupService.stopScheduledCleanup();
  }

  await client.close();
  console.log("✅ Database connection closed");
  process.exit(0);
});

// Start the server
startServer().catch(console.error);
