import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ledgvyn API",
      version: "1.0.0",
      description: "Ledgvyn is an API for corporate finance dashboard systems, enabling efficient financial tracking, project-based team collaboration, and real-time data insights.",
    },
    tags: [
      { name: "Authentication", description: "Signup, login, and session management" },
      { name: "Financial Records", description: "Ledger operations for cash flow monitoring" },
      { name: "Analytics", description: "Financial insights and trajectories" },
      { name: "Project Management", description: "Project based team management" }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "Sign in first to set the session cookie."
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./routes/*.ts", "./app.ts"], 
};

export const swaggerSpec = swaggerJsdoc(options);
