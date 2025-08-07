import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import authRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import connectDatabase from "./lib/database.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
  connectDatabase();
});
