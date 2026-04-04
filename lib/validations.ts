import { z } from "zod";

export const recordSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero."),
  category: z.string().min(2, "Category is too short."),
  description: z.string().optional(),
  type: z.enum(["income", "expense"]),
  date: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(2, "Name is too short."),
  role: z.enum(["admin", "analyst", "viewer"]),
});
