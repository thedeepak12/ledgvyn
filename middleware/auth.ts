import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers), 
  });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized: Please sign in." });
  }

  const user = session.user as any;
  if (!user.projectId) {
    return res.status(403).json({ error: "No project linked to this account." });
  }

  (req as any).user = user;
  (req as any).projectId = user.projectId;

  return next();
};
