import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const uri = process.env.ATLAS_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function migrateMessages() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas for migration");

    const db = client.db("chatx");
    const messagesCollection = db.collection("messages");

    // Find messages without status field
    const messagesWithoutStatus = await messagesCollection.find({
      status: { $exists: false }
    }).toArray();

    console.log(`📊 Found ${messagesWithoutStatus.length} messages without status field`);

    if (messagesWithoutStatus.length > 0) {
      // Update all messages without status field
      const result = await messagesCollection.updateMany(
        { status: { $exists: false } },
        {
          $set: {
            status: {
              sent: true,
              delivered: false,
              read: false,
              deliveredAt: null,
              readAt: null,
              deliveredTo: [],
              readBy: []
            }
          }
        }
      );

      console.log(`✅ Migration completed! Updated ${result.modifiedCount} messages`);
    } else {
      console.log("✅ All messages already have status field");
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await client.close();
    console.log("🔌 Database connection closed");
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateMessages().catch(console.error);
}

export { migrateMessages };
