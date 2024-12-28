import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const sourceDbUrl = process.env.MONGO_URL.replace("coworking_db", "test");
const targetDbUrl = process.env.MONGO_URL;

const migrateData = async () => {
  try {
    // Connect to the source database (test)
    const sourceConnection = await mongoose.createConnection(sourceDbUrl, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });

    // Connect to the target database (coworking_db)
    const targetConnection = await mongoose.createConnection(targetDbUrl, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });

    // Ensure connections are established
    await sourceConnection.asPromise();
    await targetConnection.asPromise();

    // Get all collections from the source database
    const collections = await sourceConnection.db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      const sourceCollection = sourceConnection.collection(collectionName);
      const targetCollection = targetConnection.collection(collectionName);

      // Read all documents from the source collection
      const documents = await sourceCollection.find().toArray();

      if (documents.length > 0) {
        // Insert documents into the target collection
        await targetCollection.insertMany(documents);
        console.log(
          `Migrated ${documents.length} documents from ${collectionName}`
        );
      }
    }

    console.log("Data migration completed successfully.");
    sourceConnection.close();
    targetConnection.close();
  } catch (error) {
    console.error("Error migrating data:", error);
    process.exit(1);
  }
};

migrateData();
