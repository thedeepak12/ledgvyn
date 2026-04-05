import { Router, Request, Response } from "express";
import { authGuard } from "../middleware/auth";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { recordSchema } from "../lib/validations";

const router: Router = Router();

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, description, date]
 *             properties:
 *               amount: { type: number, example: 450 }
 *               type: { type: string, enum: [income, expense], example: "expense" }
 *               category: { type: string, example: "Marketing" }
 *               description: { type: string, example: "Facebook Ads" }
 *               date: { type: string, format: date, example: "2024-03-25" }
 *     responses:
 *       201:
 *         description: Record successfully created
 *       400:
 *         description: Validation Error (Invalid amount, missing fields, etc.)
 *       401:
 *         description: Unauthorized (Invalid or missing session cookie)
 *       403:
 *         description: Forbidden (Only Admins can create records)
 *       500:
 *         description: Failed to create record
 */

router.post("/", authGuard, async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only admins can create records." });
	}

	const validation = recordSchema.safeParse(req.body);
	if (!validation.success) {
		return res.status(400).json({ error: validation.error.format() });
	}

  const { amount, category, description, type, date } = req.body;
  const projectId = (req as any).projectId;
  const userId = (req as any).user.id;

  try {
    const [record] = await db.insert(schema.financialRecords).values({
      id: uuidv4(),
      amount: amount.toString(),
      category,
      description,
      type,
      date: date ? new Date(date) : new Date(),
      projectId,
      userId,
    }).returning();

    return res.status(201).json(record);
  } catch (error) {
    console.error("Create Record Error:", error);
    return res.status(500).json({ error: "Failed to create record." });
  }
});

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all financial records
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of records
 *       401:
 *         description: Unauthorized (Invalid or missing session cookie)
 *       403:
 *         description: Access Denied (Viewers cannot see raw data)
 *       500:
 *         description: Failed to fetch records
 */

router.get("/", authGuard, async (req: Request, res: Response) => {
	const user = (req as any).user;
	if (user.role === "viewer") {
		return res.status(403).json({ error: "Access denied: Viewers cannot view records." });
	}

  const projectId = (req as any).projectId;

  try {
    const records = await db.query.financialRecords.findMany({
      where: eq(schema.financialRecords.projectId, projectId),
      orderBy: [desc(schema.financialRecords.date)],
    });
    return res.json(records);
  } catch (error) {
    console.error("List Error:", error);
    return res.status(500).json({ error: "Failed to fetch records." });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number, example: 500 }
 *               category: { type: string, example: "Hosting" }
 *               description: { type: string, example: "AWS bill" }
 *               type: { type: string, enum: [income, expense], example: "expense" }
 *     responses:
 *       200:
 *         description: Record successfully updated
 *       400:
 *         description: Validation error (Invalid amount, missing fields, etc.)
 *       401:
 *         description: Unauthorized (Invalid or missing session cookie)
 *       403:
 *         description: Access Denied (Only Admins can update records)
 *       404:
 *         description: Record not found in your project
 *       500:
 *         description: Failed to update record
 */

router.put("/:id", authGuard, async (req: Request, res: Response) => {
  const id = req.params.id as string;
	const projectId = (req as any).projectId;

	const user = (req as any).user;
	if (user.role !== "admin") {
		return res.status(403).json({ error: "Access denied: Only admins can update records." });
	}

	const validation = recordSchema.safeParse(req.body);
	if (!validation.success) {
		return res.status(400).json({ error: validation.error.format() });
	}

  const { amount, category, description, type } = req.body;

  try {
    const [updatedRecord] = await db.update(schema.financialRecords)
      .set({
        amount: amount?.toString(),
        category,
        description,
        type,
      })
      .where(and(
        eq(schema.financialRecords.id, id),
        eq(schema.financialRecords.projectId, projectId)
      ))
      .returning();

    if (!updatedRecord) return res.status(404).json({ error: "Access denied or not found." });
    return res.json(updatedRecord);
  } catch (error) {
    return res.status(500).json({ error: "Update failed." });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Delete a financial record
 *     tags: [Financial Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The record ID
 *     responses:
 *       200:
 *         description: Record successfully deleted
 *       401:
 *         description: Unauthorized (Invalid or missing session cookie)
 *       403:
 *         description: Access Denied (Only Admins can delete records)
 *       404:
 *         description: Record not found
 *       500:
 *         description: Failed to delete record
 */

router.delete("/:id", authGuard, async (req: Request, res: Response) => {
  const id = req.params.id as string;
	const projectId = (req as any).projectId;

	const user = (req as any).user;
	if (user.role !== "admin") {
		return res.status(403).json({ error: "Access denied: Only admins can delete the records." });
	}

  try {
    const [deletedRecord] = await db.delete(schema.financialRecords)
      .where(and(
        eq(schema.financialRecords.id, id),
        eq(schema.financialRecords.projectId, projectId)
      ))
      .returning();

    if (!deletedRecord) return res.status(404).json({ error: "Access denied or not found." });
    return res.json({ message: "Deleted successfully", record: deletedRecord });
  } catch (error) {
    return res.status(500).json({ error: "Delete failed." });
  }
});

export default router;
