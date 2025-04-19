import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertCampaignSchema, insertContributionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Campaigns API
  app.get("/api/campaigns", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let campaigns;
      if (categoryId) {
        campaigns = await storage.getCampaignsByCategory(categoryId, limit, offset);
      } else {
        campaigns = await storage.getCampaigns(limit, offset);
      }
      
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Contributions API
  app.get("/api/contributions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contributions = await storage.getContributionsByUser(userId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  app.get("/api/contributions/campaign/:campaignId", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const contributions = await storage.getContributionsByCampaign(campaignId);
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contributions" });
    }
  });

  app.post("/api/contributions", async (req, res) => {
    try {
      const validatedData = insertContributionSchema.parse(req.body);
      
      // Check if transaction hash already exists
      const contributions = await storage.getContributionsByCampaign(validatedData.campaignId);
      const existingTx = contributions.find(c => 
        c.transactionHash.toLowerCase() === validatedData.transactionHash.toLowerCase()
      );
      
      if (existingTx) {
        return res.status(400).json({ message: "Transaction already processed" });
      }
      
      const contribution = await storage.createContribution(validatedData);
      res.status(201).json(contribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contribution data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contribution" });
    }
  });

  // Users API
  app.get("/api/users/wallet/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const user = await storage.getUserByWalletAddress(address);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if wallet address already exists
      const existingUser = await storage.getUserByWalletAddress(validatedData.walletAddress);
      if (existingUser) {
        return res.status(400).json({ message: "Wallet address already registered" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
