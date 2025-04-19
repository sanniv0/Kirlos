import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useWallet } from '@/hooks/use-wallet';
import { useGetCampaigns, useGetCategories } from '@/hooks/use-campaigns';
import { useGetUserContributions } from '@/hooks/use-contributions';
import { formatAmount, formatDate, getExplorerUrl } from '@/lib/utils';
import { Campaign, Category, Contribution } from '@shared/schema';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyContributions() {
  const { wallet } = useWallet();
  const userId = 1; // This would normally come from the authenticated user
  
  const { data: contributions = [], isLoading: isLoadingContributions } = useGetUserContributions(userId);
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useGetCampaigns();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();
  
  // Calculate total contributed amount
  const totalContributed = contributions.reduce(
    (total, contribution) => total + contribution.amount,
    0
  );
  
  // Get campaign details for a contribution
  const getCampaignDetails = (campaignId: number): Campaign | undefined => {
    return campaigns.find(campaign => campaign.id === campaignId);
  };
  
  // Get category for a campaign
  const getCategoryForCampaign = (campaign?: Campaign): Category | undefined => {
    if (!campaign) return undefined;
    return categories.find(cat => cat.id === campaign.categoryId);
  };
  
  // Get category color style
  const getCategoryStyle = (campaign?: Campaign) => {
    const category = getCategoryForCampaign(campaign);
    if (!category) return {};
    return { color: category.color };
  };
  
  // Format category name
  const formatCategoryName = (campaign?: Campaign) => {
    const category = getCategoryForCampaign(campaign);
    return category?.name || 'Unknown';
  };
  
  // Render contribution table
  const renderContributionTable = () => {
    if (isLoadingContributions || isLoadingCampaigns || isLoadingCategories) {
      return (
        <div className="space-y-2">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (contributions.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No contributions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Explore campaigns and make your first contribution.
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableCaption>A list of your recent contributions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributions.map((contribution) => {
            const campaign = getCampaignDetails(contribution.campaignId);
            
            return (
              <TableRow key={contribution.id}>
                <TableCell className="font-medium">
                  {formatDate(contribution.timestamp)}
                </TableCell>
                <TableCell>{campaign?.title || 'Unknown Campaign'}</TableCell>
                <TableCell>
                  <span style={getCategoryStyle(campaign)}>
                    {formatCategoryName(campaign)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(contribution.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <a 
                    href={getExplorerUrl(contribution.transactionHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-600"
                  >
                    View
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Contributions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Track all your contributions to various campaigns
        </p>
      </div>
      
      {!wallet.isConnected && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Please connect your wallet to view your contributions.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Contribution Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Contributed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoadingContributions ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatAmount(totalContributed)
                  )}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Campaigns Supported</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoadingContributions ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    new Set(contributions.map(c => c.campaignId)).size
                  )}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoadingContributions ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    contributions.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Contribution History</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContributionTable()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
