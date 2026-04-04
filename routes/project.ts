import { Router, Request, Response } from "express";
import { authGuard } from "../middleware/auth";
import { auth } from "../lib/auth";
import { createUserSchema } from "../lib/validations";

const router: Router = Router();

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
