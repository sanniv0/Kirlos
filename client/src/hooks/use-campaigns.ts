import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { createCampaign as createCampaignContract } from '@/lib/ethers';
import { useToast } from '@/hooks/use-toast';
import { Campaign, Category } from '@shared/schema';

// Get all campaigns
export const useGetCampaigns = (categoryId?: number) => {
  const queryKey = categoryId 
    ? [`/api/campaigns?categoryId=${categoryId}`]
    : ['/api/campaigns'];
    
  return useQuery<Campaign[]>({
    queryKey,
  });
};

// Get a single campaign by ID
export const useGetCampaign = (id: number) => {
  return useQuery<Campaign>({
    queryKey: [`/api/campaigns/${id}`],
    enabled: !!id,
  });
};

// Get all categories
export const useGetCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
};

// Create a new campaign (combines blockchain and API calls)
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      goal: number;
      deadline: Date;
      imageUrl: string;
      creatorId: number;
      categoryId: number;
    }) => {
      try {
        // First, create campaign on blockchain
        const contractResult = await createCampaignContract(
          data.title,
          data.description,
          data.goal.toString(),
          data.deadline
        );
        
        if (!contractResult) {
          throw new Error('Failed to create campaign on the blockchain');
        }
        
        // Then save to our backend
        const apiData = {
          ...data,
          contractAddress: contractResult.txHash,
        };
        
        const response = await apiRequest('POST', '/api/campaigns', apiData);
        return await response.json();
      } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the campaigns query to update the list
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Campaign Creation Failed',
        description: error.message || 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
