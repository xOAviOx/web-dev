import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from the .env file");
  }

  const connection = await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME });
  console.log(`MongoDB connected: ${connection.connection.name}`);
};

export default connectDB;
