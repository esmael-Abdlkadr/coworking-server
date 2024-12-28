import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../src/models/events.js";

// Load environment variables from .env file
dotenv.config();

const getDatabaseName = (connectionString) => {
  const url = new URL(connectionString);
  const pathname = url.pathname;
  return pathname ? pathname.split("/")[1] : "test";
};

const updateEvents = async () => {
  try {
    const connectionString = process.env.MONGO_URL;
    const dbName = getDatabaseName(connectionString);

    await mongoose.connect(connectionString, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      dbName: dbName,
    });

    const defaultCapacity = 100;

    await Event.updateMany(
      { capacity: { $exists: false } }, // Only update documents where capacity does not exist
      { $set: { capacity: defaultCapacity } }
    );

    console.log("All events updated successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating events:", error);
    mongoose.connection.close();
  }
};

updateEvents();
