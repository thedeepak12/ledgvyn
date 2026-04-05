import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import recordsRouter from "./routes/records";
import projectRouter from "./routes/project";
import analyticsRouter from "./routes/analytics";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";

const app: express.Application = express();
const port = 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});
app.use("/api/auth", toNodeHandler(auth));
app.use("/api/records", recordsRouter);
app.use("/api/project", projectRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Ledgvyn API Docs",
  customfavIcon: "null",
  customCss: `
    .swagger-ui .topbar {
      display: none !important;
    }
  `
}));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
