import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { healthRouter } from "./routes/health.js";
import { splitsRouter } from "./routes/splits.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

dotenv.config();

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : "*";

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "SplitNaira API",
    status: "ok",
    version: "0.1.0"
  });
});

app.use("/health", healthRouter);
app.use("/splits", splitsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`SplitNaira API listening on :${port}`);
});
