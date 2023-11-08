import { z } from "zod";

export const registrationSchema = z.object({
  storeName: z.string().min(1, { message: "Store name is too short." }),
  latitude: z.number(),
  longitude: z.number(),
});

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;
