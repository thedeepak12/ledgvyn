import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: express.Application = express();
const port = 3000;

app.use(express.json());

app.use("/api/auth", toNodeHandler(auth));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
