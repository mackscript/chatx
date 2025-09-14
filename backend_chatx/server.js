import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
const uri = process.env.ATLAS_URI;
let db;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB Atlas
async function connectToDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    // Set the database (you can change 'chatx' to your preferred database name)
    db = client.db('chatx');
    
    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error);
    process.exit(1);
  }
}

// Basic route to test server
app.get('/', (req, res) => {
  res.json({ 
    message: 'ChatX Backend Server is running!',
    database: db ? 'Connected to MongoDB Atlas' : 'Database not connected'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await client.db("admin").command({ ping: 1 });
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Example chat endpoints (you can expand these)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.collection('messages').find({}).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { message, user, timestamp } = req.body;
    const result = await db.collection('messages').insertOne({
      message,
      user,
      timestamp: timestamp || new Date().toISOString()
    });
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server and connect to database
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await client.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Start the server
startServer().catch(console.error);
