import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

// Campaign categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true,
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  goal: doublePrecision("goal").notNull(),
  currentAmount: doublePrecision("current_amount").default(0),
  deadline: timestamp("deadline").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  contractAddress: text("contract_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  currentAmount: true,
  createdAt: true,
});

// Contributions table
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  transactionHash: text("transaction_hash").notNull().unique(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  timestamp: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  contributions: many(contributions)
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  campaigns: many(campaigns)
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, { fields: [campaigns.creatorId], references: [users.id] }),
  category: one(categories, { fields: [campaigns.categoryId], references: [categories.id] }),
  contributions: many(contributions)
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  user: one(users, { fields: [contributions.userId], references: [users.id] }),
  campaign: one(campaigns, { fields: [contributions.campaignId], references: [campaigns.id] })
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Contribution = typeof contributions.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
