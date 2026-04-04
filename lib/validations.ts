import { z } from "zod";

export const recordSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().min(2, "Category is too short."),
  description: z.string().optional(),
  type: z.enum(["income", "expense"]),
  date: z.string().optional(),
});
