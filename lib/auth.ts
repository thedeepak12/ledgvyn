import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        project: schema.projects,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "admin",
      },
      projectId: {
        type: "string",
        required: false,
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const body = context?.body as any;

          if (body?.projectId) {
            return {
              data: {
                ...user,
                projectId: body.projectId,
                role: body.role,
              }
            }
          }

          const companyName = body?.companyName;
          const projectId = uuidv4();

          await db.insert(schema.projects).values({
            id: projectId,
            name: companyName,
          });

          return {
            data: { ...user, projectId, role: "admin" },
          };
        },
      },
    },
  },
  advanced: {
    disableCSRFCheck: true,
  },
});
