import { Router } from "express";
import { db } from "../db";
import { financialRecords } from "../db/schema";
import { authGuard } from "../middleware/auth";
import { and, eq, gte, lte, sql, inArray } from "drizzle-orm";
import { z } from "zod";

const router: Router = Router();

const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  categories: z.string().optional(),
});

router.get("/summary", authGuard, async (req, res) => {
  try {
    const filters = filterSchema.parse(req.query);
    const projectId = (req as any).user!.projectId!;

    const conditions = [eq(financialRecords.projectId, projectId)];

    if (filters.startDate) conditions.push(gte(financialRecords.date, new Date(filters.startDate)));
    if (filters.endDate) conditions.push(lte(financialRecords.date, new Date(filters.endDate)));
    if (filters.type) conditions.push(eq(financialRecords.type, filters.type));
    if (filters.categories) {
      conditions.push(inArray(financialRecords.category, filters.categories.split(",")));
    }

    const result = await db
      .select({
        type: financialRecords.type,
        total: sql<number>`SUM(${financialRecords.amount})`.mapWith(Number),
      })
      .from(financialRecords)
      .where(and(...conditions))
      .groupBy(financialRecords.type);

    const totals = {
      income: result.find((r) => r.type === "income")?.total || 0,
      expense: result.find((r) => r.type === "expense")?.total || 0,
    };

    res.json({
      income: totals.income,
      expense: totals.expense,
      net: totals.income - totals.expense,
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid filters or calculation error" });
  }
});

router.get("/categories", authGuard, async (req, res) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole === "viewer") {
      return res.status(403).json({ error: "Access Denied: Viewers cannot see category breakdowns." });
    }

    const filters = filterSchema.parse(req.query);
    const projectId = (req as any).user!.projectId!;

    const conditions = [eq(financialRecords.projectId, projectId)];

    if (filters.startDate) conditions.push(gte(financialRecords.date, new Date(filters.startDate)));
    if (filters.endDate) conditions.push(lte(financialRecords.date, new Date(filters.endDate)));
    if (filters.type) conditions.push(eq(financialRecords.type, filters.type));

    const result = await db
      .select({
        category: financialRecords.category,
        total: sql<number>`SUM(${financialRecords.amount})`.mapWith(Number),
        count: sql<number>`COUNT(${financialRecords.id})`.mapWith(Number),
      })
      .from(financialRecords)
      .where(and(...conditions))
      .groupBy(financialRecords.category)
      .orderBy(sql`SUM(${financialRecords.amount}) DESC`);

    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: "Failed to fetch categories"});
  }
});

router.get("/trends", authGuard, async (req, res) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole === "viewer") {
      return res.status(403).json({ error: "Access Denied: Viewers cannot see financial trends." });
    }

    const filters = filterSchema.parse(req.query);
    const projectId = (req as any).user!.projectId!;

    const conditions = [eq(financialRecords.projectId, projectId)];

    if (filters.startDate) conditions.push(gte(financialRecords.date, new Date(filters.startDate)));
    if (filters.endDate) conditions.push(lte(financialRecords.date, new Date(filters.endDate)));

    const monthBucket = sql`TO_CHAR(${financialRecords.date}, 'YYYY-MM')`;

    const result = await db
      .select({
        period: monthBucket,
        type: financialRecords.type,
        total: sql<number>`SUM(${financialRecords.amount})`.mapWith(Number),
      })
      .from(financialRecords)
      .where(and(...conditions))
      .groupBy(monthBucket, financialRecords.type)
      .orderBy(monthBucket);

    const trendsMap = new Map<string, any>();

    result.forEach((row) => {
      const period = row.period as string;
      if (!trendsMap.has(period)) {
        trendsMap.set(period, { period, income: 0, expense: 0 });
      }
      const trend = trendsMap.get(period);
      if (row.type === "income") trend.income = row.total;
      if (row.type === "expense") trend.expense = row.total;
    });

    return res.json(Array.from(trendsMap.values()));
  } catch (error) {
    return res.status(400).json({ error: "Failed to fetch trends" });
  }
});

export default router;
