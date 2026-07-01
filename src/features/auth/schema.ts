import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .email({ message: "Email is not valid" })
    .min(1, { message: "Email is required" })
    .min(5, { message: "Email must be at least 5 characters" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
