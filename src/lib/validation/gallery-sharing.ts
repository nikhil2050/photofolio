import { z } from "zod";

export const accessModeSchema = z.enum(["link", "password"]);

export const shareSettingsSchema = z
  .object({
    accessMode: accessModeSchema,
    password: z.string().min(8, "Use at least 8 characters.").max(128).optional(),
  })
  .superRefine((value, context) => {
    if (value.accessMode === "password" && !value.password) {
      context.addIssue({ code: "custom", path: ["password"], message: "Set a password for password-protected access." });
    }
  });

export const sharingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("publish"), accessMode: accessModeSchema, password: z.string().max(128).optional() }),
  z.object({ action: z.literal("update-access"), accessMode: accessModeSchema, password: z.string().max(128).optional() }),
  z.object({ action: z.literal("rotate-link") }),
  z.object({ action: z.literal("unpublish") }),
  z.object({ action: z.literal("archive") }),
]);

export type AccessMode = z.infer<typeof accessModeSchema>;
