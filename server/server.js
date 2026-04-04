import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const authRoutes = express.Router();
authRoutes.post("/register", (req, res) => res.json({ success: true, message: "User registered" }));
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
    }
  } catch (error) {
    console.error("MongoDB error (Server continuing):", error.message);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
