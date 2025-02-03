import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import routes from "./routes/index";

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get("/", async (req: Request, res: Response) => {
  try {
    res.json({ message: "Working fine sss" });
  } catch (error) {
    console.log(error);
  }
});

app.use("/api/v1", routes);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorMessage = error.message || "Something went wrong";
  const errorStatus = (error as any).status || 500;

  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
