import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().startsWith("https://"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export function parsePublicEnv(input: Record<string, string | undefined>) {
  const result = publicEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Supabase configuration is missing or invalid.");
  }

  return {
    supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } as const;
}

export function getPublicEnv() {
  return parsePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
