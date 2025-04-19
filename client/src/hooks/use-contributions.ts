import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { contributeToCampaign } from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';
import { Contribution } from '@shared/schema';

// Get contributions by user ID
export const useGetUserContributions = (userId: number) => {
  return useQuery<Contribution[]>({
    queryKey: [`/api/contributions/user/${userId}`],
    enabled: !!userId,
  });
};

// Get contributions by campaign ID
export const useGetCampaignContributions = (campaignId: number) => {
  return useQuery<Contribution[]>({
    queryKey: [`/api/contributions/campaign/${campaignId}`],
    enabled: !!campaignId,
  });
};

// Create a contribution (combines blockchain and API calls)
export const useCreateContribution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      userId: number;
      campaignId: number;
      amount: number;
    }) => {
      try {
        // First, contribute on blockchain
        const contractResult = await contributeToCampaign(
          data.campaignId,
          data.amount.toString()
        );
        
        if (!contractResult) {
          throw new Error('Failed to process contribution on the blockchain');
        }
        
        // Then save to our backend
        const apiData = {
          userId: data.userId,
          campaignId: data.campaignId,
          amount: data.amount,
          transactionHash: contractResult.txHash,
        };
        
        const response = await apiRequest('POST', '/api/contributions', apiData);
        return await response.json();
      } catch (error) {
        console.error('Error creating contribution:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to update the data
      queryClient.invalidateQueries({ queryKey: [`/api/contributions/user/${variables.userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contributions/campaign/${variables.campaignId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${variables.campaignId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
      toast({
        title: 'Contribution Successful',
        description: `You have successfully contributed ${variables.amount} AVAX.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Contribution Failed',
        description: error.message || 'Failed to contribute. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
