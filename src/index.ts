import express from "express";
import { prisma } from "./utils/db";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    res.json({ message: "Working fine" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({
    data: { name, email },
  });
  res.json({message : "User created successfully" , user});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
