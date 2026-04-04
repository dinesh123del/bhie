import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://client-zeta-teal.vercel.app"
  ],
  credentials: true
}));

// ✅ ADD THIS ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend is LIVE 🚀");
});

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
