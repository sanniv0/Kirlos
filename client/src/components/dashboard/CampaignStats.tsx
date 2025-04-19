import { useGetCampaigns } from '@/hooks/use-campaigns';
import { Campaign } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, HandCoins, Users } from 'lucide-react';
import { formatAmount } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';
import { useGetUserContributions } from '@/hooks/use-contributions';

export function CampaignStats() {
  const { data: campaigns = [], isLoading } = useGetCampaigns();
  const { wallet } = useWallet();
  const { data: userContributions = [] } = useGetUserContributions(1); // This would be the logged-in user's ID
  
  // Calculate stats
  const activeCampaigns = campaigns.length;
  
  const totalContributions = campaigns.reduce(
    (total, campaign) => total + campaign.currentAmount,
    0
  );
  
  const userContributionsCount = userContributions.length;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                <div className="ml-5 w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-white dark:bg-gray-800 shadow">
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 rounded-full p-3">
              <Vote className="text-primary dark:text-primary-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Campaigns
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeCampaigns}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-gray-800 shadow">
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-3">
              <HandCoins className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Contributions
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatAmount(totalContributions)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-gray-800 shadow">
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <Users className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Your Contributions
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {userContributionsCount}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
