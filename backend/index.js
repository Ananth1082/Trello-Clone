import "dotenv/config";
import mongoose from "mongoose";

if (!process.env.DATABASE_URL) throw Error("Database url not found");

await mongoose.connect(process.env.DATABASE_URL);
console.log("MongoDB connected");
