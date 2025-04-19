import {
  users, campaigns, contributions, categories,
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Contribution, type InsertContribution,
  type Category, type InsertCategory
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaigns(limit?: number, offset?: number): Promise<Campaign[]>;
  getCampaignsByCategory(categoryId: number, limit?: number, offset?: number): Promise<Campaign[]>;
  getCampaignsByCreator(creatorId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignAmount(id: number, amount: number): Promise<Campaign | undefined>;

  // Contribution methods
  getContribution(id: number): Promise<Contribution | undefined>;
  getContributionsByUser(userId: number): Promise<Contribution[]>;
  getContributionsByCampaign(campaignId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private contributions: Map<number, Contribution>;
  private categories: Map<number, Category>;
  private currentUserId: number;
  private currentCampaignId: number;
  private currentContributionId: number;
  private currentCategoryId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.contributions = new Map();
    this.categories = new Map();
    this.currentUserId = 1;
    this.currentCampaignId = 1;
    this.currentContributionId = 1;
    this.currentCategoryId = 1;

    // Initialize with default categories
    this.initializeCategories();
  }

  private initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Technology", color: "#6366f1" },
      { name: "Art & Creative", color: "#8b5cf6" },
      { name: "Community", color: "#10b981" },
      { name: "DeFi", color: "#3b82f6" },
      { name: "NFT", color: "#f59e0b" },
      { name: "Gaming", color: "#ef4444" }
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress.toLowerCase() === address.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaigns(limit = 100, offset = 0): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getCampaignsByCategory(categoryId: number, limit = 100, offset = 0): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.categoryId === categoryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getCampaignsByCreator(creatorId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.creatorId === creatorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      currentAmount: 0,
      createdAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaignAmount(id: number, amount: number): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = {
      ...campaign,
      currentAmount: (campaign.currentAmount || 0) + amount,
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  // Contribution methods
  async getContribution(id: number): Promise<Contribution | undefined> {
    return this.contributions.get(id);
  }

  async getContributionsByUser(userId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values())
      .filter(contribution => contribution.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getContributionsByCampaign(campaignId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values())
      .filter(contribution => contribution.campaignId === campaignId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = this.currentContributionId++;
    const contribution: Contribution = {
      ...insertContribution,
      id,
      timestamp: new Date(),
    };
    this.contributions.set(id, contribution);

    // Update campaign amount
    await this.updateCampaignAmount(contribution.campaignId, contribution.amount);

    return contribution;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    const { db } = await import('./db');
    const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
    const { db } = await import('./db');
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const { db } = await import('./db');
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaigns(limit = 100, offset = 0): Promise<Campaign[]> {
    const { db } = await import('./db');
    return db.select().from(campaigns)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCampaignsByCategory(categoryId: number, limit = 100, offset = 0): Promise<Campaign[]> {
    const { db } = await import('./db');
    return db.select().from(campaigns)
      .where(eq(campaigns.categoryId, categoryId))
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCampaignsByCreator(creatorId: number): Promise<Campaign[]> {
    const { db } = await import('./db');
    return db.select().from(campaigns)
      .where(eq(campaigns.creatorId, creatorId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const { db } = await import('./db');
    const [campaign] = await db.insert(campaigns).values(insertCampaign).returning();
    return campaign;
  }

  async updateCampaignAmount(id: number, amount: number): Promise<Campaign | undefined> {
    const { db } = await import('./db');
    const campaign = await this.getCampaign(id);
    if (!campaign) return undefined;
    
    const newAmount = (campaign.currentAmount || 0) + amount;
    const [updatedCampaign] = await db
      .update(campaigns)
      .set({ currentAmount: newAmount })
      .where(eq(campaigns.id, id))
      .returning();
    
    return updatedCampaign;
  }

  // Contribution methods
  async getContribution(id: number): Promise<Contribution | undefined> {
    const { db } = await import('./db');
    const [contribution] = await db.select().from(contributions).where(eq(contributions.id, id));
    return contribution || undefined;
  }

  async getContributionsByUser(userId: number): Promise<Contribution[]> {
    const { db } = await import('./db');
    return db.select().from(contributions)
      .where(eq(contributions.userId, userId))
      .orderBy(desc(contributions.timestamp));
  }

  async getContributionsByCampaign(campaignId: number): Promise<Contribution[]> {
    const { db } = await import('./db');
    return db.select().from(contributions)
      .where(eq(contributions.campaignId, campaignId))
      .orderBy(desc(contributions.timestamp));
  }

  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const { db } = await import('./db');
    const [contribution] = await db.insert(contributions).values(insertContribution).returning();
    
    // Update campaign amount
    await this.updateCampaignAmount(contribution.campaignId, contribution.amount);
    
    return contribution;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const { db } = await import('./db');
    return db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const { db } = await import('./db');
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const { db } = await import('./db');
    const [category] = await db.select().from(categories).where(eq(categories.name, name));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const { db } = await import('./db');
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
}

// Initialize the default categories
async function initializeDefaultCategories() {
  const defaultCategories: InsertCategory[] = [
    { name: "Technology", color: "#6366f1" },
    { name: "Art & Creative", color: "#8b5cf6" },
    { name: "Community", color: "#10b981" },
    { name: "DeFi", color: "#3b82f6" },
    { name: "NFT", color: "#f59e0b" },
    { name: "Gaming", color: "#ef4444" }
  ];

  const storage = new DatabaseStorage();
  for (const category of defaultCategories) {
    const existingCategory = await storage.getCategoryByName(category.name);
    if (!existingCategory) {
      await storage.createCategory(category);
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize categories when the app starts
initializeDefaultCategories().catch(err => {
  console.error('Error initializing categories:', err);
});
