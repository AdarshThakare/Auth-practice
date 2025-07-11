import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/db.config.js";
import authRoutes from "./routes/auth.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/v1/user", authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDB();
  console.log("\n-> Process is running on PORT :", PORT);
});
