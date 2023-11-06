import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "This is not a valid email address," }),
  password: z.string().min(5).max(20),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
