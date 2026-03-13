import { z } from "zod";

// News article type shared between frontend and backend
export const newsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  category: z.string(),
  publishedAt: z.string(),
  imageUrl: z.string().optional(),
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;

export const categorySchema = z.enum([
  "all",
  "models",
  "research",
  "industry",
  "products",
  "policy",
]);

export type Category = z.infer<typeof categorySchema>;
