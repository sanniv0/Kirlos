import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { CampaignFilter } from '@/components/dashboard/CampaignFilter';
import { Button } from '@/components/ui/button';
import { ArrowDown, Search } from 'lucide-react';
import { useGetCampaigns, useGetCategories } from '@/hooks/use-campaigns';
import { Campaign } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExploreCampaigns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState('newest');
  const [visibleCampaigns, setVisibleCampaigns] = useState(9);
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useGetCampaigns();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();
  
  // Filter campaigns by tab
  const getCampaignsByTab = (campaigns: Campaign[]) => {
    switch (activeTab) {
      case 'trending':
        return [...campaigns].sort((a, b) => b.currentAmount - a.currentAmount);
      case 'ending-soon':
        return [...campaigns].sort((a, b) => 
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        );
      case 'new':
        return [...campaigns].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'all':
      default:
        return campaigns;
    }
  };
  
  // Filter and sort campaigns
  const filteredCampaigns = getCampaignsByTab(campaigns)
    .filter(campaign => {
      // Filter by category if selected
      if (selectedCategoryId && campaign.categoryId !== selectedCategoryId) {
        return false;
      }
      
      // Filter by search term
      if (!searchTerm) return true;
      return campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'most-funded':
          return b.currentAmount - a.currentAmount;
        case 'ending-soon':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'recently-added':
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  
  // Get visible campaigns
  const displayedCampaigns = filteredCampaigns.slice(0, visibleCampaigns);
  
  // Load more campaigns
  const handleLoadMore = () => {
    setVisibleCampaigns(prev => prev + 6);
  };
  
  // Get category for a campaign
  const getCategoryForCampaign = (campaign: Campaign) => {
    return categories.find(cat => cat.id === campaign.categoryId);
  };
  
  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover and support innovative projects on the blockchain
          </p>
        </div>
        
        <div className="relative mt-4 md:mt-0 w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={16} />
          </div>
          <Input
            type="text"
            placeholder="Search campaigns..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
          <TabsTrigger value="new">Newly Added</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <CampaignFilter
            onSearch={setSearchTerm}
            onCategoryChange={setSelectedCategoryId}
            onSortChange={setSortOption}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6 bg-white dark:bg-gray-800 shadow rounded-lg">
            {isLoadingCampaigns || isLoadingCategories ? (
              Array(9).fill(null).map((_, index) => (
                <div key={index} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative pb-1/2 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="flex justify-between mb-3">
                      <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : displayedCampaigns.length > 0 ? (
              displayedCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  category={getCategoryForCampaign(campaign)}
                />
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No campaigns found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
          
          {/* Load more button */}
          {filteredCampaigns.length > visibleCampaigns && (
            <div className="px-4 py-4 md:px-6 border-t border-gray-200 dark:border-gray-700 flex justify-center bg-white dark:bg-gray-800 shadow rounded-lg mt-2">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Other tabs have the same content structure */}
        <TabsContent value="trending" className="mt-6">
          {/* Same structure as "all" tab */}
        </TabsContent>
        
        <TabsContent value="ending-soon" className="mt-6">
          {/* Same structure as "all" tab */}
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          {/* Same structure as "all" tab */}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
