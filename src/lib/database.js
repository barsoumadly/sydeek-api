import mongoose from "mongoose";

const connectDatabase = async function () {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connection: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to database ${error}`);
    process.exit(1);
  }
};

export default connectDatabase;
