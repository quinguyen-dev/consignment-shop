import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(5, { message: "Password is too short." }),
});

export const registrationSchema = z
  .object({
    storeName: z.string().min(1, { message: "Store name is too short." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(5, { message: "Password is too short." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
    latitude: z.number(),
    longitude: z.number(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type registrationSchemaType = z.infer<typeof registrationSchema>;
