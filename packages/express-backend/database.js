import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
let connection;

const connectDB = async () => {
  console.log("connecting db...");
  if (!connection) {
    try {
      connection = await mongoose.connect(uri, {
        dbName: "WhatsForDinner"
      });
      //console.log(mongoose.connection.readyState);
      console.log("DB connected");
      console.log(mongoose.connection.db.databaseName);
    } catch (error) {
      console.error("Error connecting DB", error);
    }
    return connection;
  }
};

export default connectDB;