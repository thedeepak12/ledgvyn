import { Router, Request, Response } from "express";
import { authGuard } from "../middleware/auth";
import { auth } from "../lib/auth";
import { createUserSchema } from "../lib/validations";

const router: Router = Router();

/**
 * @swagger
 * /api/project/users:
 *   post:
 *     summary: Invite a new team member to your project
 *     tags: [Project Management]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, role]
 *             properties:
 *               email: { type: string, format: email, example: "newuser@company.com" }
 *               password: { type: string, format: password, example: "B8uqC/HewKWFPQOJtXjgLg==!" }
 *               name: { type: string, example: "Analyst User" }
 *               role: { type: string, enum: [analyst, viewer], example: "analyst" }
 *     responses:
 *       201:
 *         description: Team member created and linked to the admin's project
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized (Invalid or missing session cookie)
 *       403:
 *         description: Forbidden (Only Admins can manage the team)
 */

router.post("/users", authGuard, async (req: Request, res: Response) => {
  const adminUser = (req as any).user;
  const adminProjectId = (req as any).projectId;

  if (adminUser.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only admins can manage the team." });
  }

  const validation = createUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  const { email, password, name, role } = validation.data;

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        role,
        projectId: adminProjectId,
      },
    });

    return res.status(201).json({
      message: "Team member joined successfully.",
      user: result.user,
    });
  } catch (error: any) {
    console.error("Provisioning Error:", error);
    const msg = error?.message || "Failed to create team member.";
    return res.status(400).json({ error: msg });
  }
});

export default router;
