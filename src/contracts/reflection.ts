import * as z from "zod/mini";
import { moods } from "../domain/moods.ts";

export const reflectionInputSchema = z.strictObject({
	writing: z.string().check(z.trim(), z.maxLength(8000)),
	moods: z.array(z.enum(moods)).check(z.maxLength(moods.length)),
}).check(z.refine(({ writing, moods: feelings }) => writing.length > 0 || feelings.length > 0));

export const reflectionResponseSchema = z.object({ text: z.string().check(z.trim(), z.minLength(1), z.maxLength(8000)) });
export type ReflectionInput = z.infer<typeof reflectionInputSchema>;
